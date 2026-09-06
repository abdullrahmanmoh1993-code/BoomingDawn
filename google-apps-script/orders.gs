/**
 * The Booming Dawn — Google Sheet order tracker + email notifier.
 *
 * The store's Worker POSTs this after every successful checkout (D1 already
 * saved the order; this web app is best-effort syncing):
 *
 *   { "token": "<same value as TOKEN below>", "order": { ... } }
 *
 * This script:
 *   1. Rejects the request unless the token matches (blocks spam rows/emails).
 *   2. Appends one row per order to the "Orders" tab (auto-created on first use).
 *   3. Emails the owner (OWNER_EMAIL) with the full order summary.
 *   4. Emails the customer (order.address.email) an order confirmation.
 *
 * ONE-TIME SETUP (~2 minutes):
 *   1. Open the Google Sheet where orders should be tracked.
 *   2. Extensions > Apps Script. Delete any default code and paste this file.
 *   3. Set TOKEN to the exact token the store owner provides.
 *   4. Deploy > New deployment > Web app:
 *        - Description: "New order tracker"
 *        - Execute as: Me
 *        - Who has access: Anyone
 *      Click Deploy and authorize when Google asks for permissions.
 *   5. Copy the /exec URL and give it to the store owner.
 */

var TOKEN = "PASTE_TOKEN_HERE";
var OWNER_EMAIL = "abdullrahman.moh1993@gmail.com";
var STORE_NAME = "The Booming Dawn";
var TAB_NAME = "Orders";

var HEADERS = [
  "Received At",
  "Order Number",
  "Customer Name",
  "Phone",
  "Email",
  "Governorate",
  "City / Area",
  "Address",
  "Items",
  "Subtotal (EGP)",
  "Discount (EGP)",
  "Delivery Fee (EGP)",
  "COD Fee (EGP)",
  "Tax (EGP)",
  "Total (EGP)",
  "Delivery Method",
  "Estimated Delivery",
  "Payment Method",
  "Payment Status",
  "Status",
];

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    if (!payload || payload.token !== TOKEN) {
      return textResponse("unauthorized", 200);
    }
    var order = payload.order;
    if (!order || !order.orderNumber) {
      return textResponse("invalid order", 200);
    }
    getOrdersSheet().appendRow(buildRow(order));
    try { sendOwnerEmail(order); } catch (err) { console.error("Owner email failed: " + err); }
    try { sendCustomerEmail(order); } catch (err) { console.error("Customer email failed: " + err); }
    return textResponse("ok", 200);
  } catch (err) {
    console.error("doPost error: " + err);
    return textResponse("error", 200);
  }
}

function doGet() {
  return textResponse("OK — The Booming Dawn order webhook", 200);
}

function textResponse(body) {
  return ContentService.createTextOutput(body).setMimeType(
    ContentService.MimeType.TEXT
  );
}

function getOrdersSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tab = ss.getSheetByName(TAB_NAME);
  if (!tab) {
    tab = ss.insertSheet(TAB_NAME);
    tab.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    tab.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    tab.setFrozenRows(1);
  }
  return tab;
}

function buildRow(order) {
  var a = order.address || {};
  return [
    Utilities.formatDate(new Date(order.createdAt), "Africa/Cairo", "yyyy-MM-dd HH:mm"),
    order.orderNumber,
    a.fullName || "",
    a.phone || "",
    a.email || "",
    a.governorate || "",
    a.city || "",
    buildAddressLine(a),
    buildItemsSummary(order.lineItems || []),
    order.subtotal || 0,
    order.discount || 0,
    order.deliveryFee || 0,
    order.codFee || 0,
    order.tax || 0,
    order.total || 0,
    order.deliveryMethod || "",
    order.estimatedDelivery || "",
    labelPayment(order.paymentMethod),
    order.paymentStatus || "",
    "New",
  ];
}

function buildAddressLine(a) {
  return [a.street, a.apartment, a.landmark, a.postalCode]
    .filter(function (p) { return String(p || "").trim() !== ""; })
    .join(", ");
}

function buildItemsSummary(items) {
  return items
    .map(function (item) {
      var label = item.name || "";
      var extras = [];
      if (item.size) extras.push(item.size);
      if (item.color) extras.push(item.color);
      if (extras.length) label += " (" + extras.join(", ") + ")";
      return label + " x" + item.quantity;
    })
    .join(" • ");
}

function labelPayment(m) {
  return { cod: "Cash on Delivery", card: "Card", instapay: "InstaPay" }[m] || m || "";
}

function money(n) {
  var value = Math.round(Number(n) || 0).toString();
  value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return value + " EGP";
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ---------------- Emails ---------------- */

function sendOwnerEmail(order) {
  var subject =
    STORE_NAME + " — New order " + order.orderNumber +
    " (" + money(order.total) + ", " + labelPayment(order.paymentMethod) + ")";
  MailApp.sendEmail(OWNER_EMAIL, subject, emailPlainText(order, true), {
    htmlBody: emailHtml(order, true),
    name: STORE_NAME,
  });
}

function sendCustomerEmail(order) {
  var email = (order.address && order.address.email) || "";
  if (!email) return;
  var subject = "Your " + STORE_NAME + " order " + order.orderNumber + " is confirmed";
  MailApp.sendEmail(email, subject, emailPlainText(order, false), {
    htmlBody: emailHtml(order, false),
    name: STORE_NAME,
  });
}

function emailPlainText(order, forOwner) {
  var a = order.address || {};
  var lines = [];
  lines.push(forOwner
    ? "New order " + order.orderNumber
    : "Thank you for your order " + order.orderNumber + "!");
  lines.push("");
  (order.lineItems || []).forEach(function (item) {
    var label = item.name + (item.size ? " (" + item.size + ")" : "");
    lines.push(label + " x" + item.quantity + " — " + money(item.unitPrice * item.quantity));
  });
  lines.push("");
  lines.push("Subtotal: " + money(order.subtotal));
  if (order.discount > 0) lines.push("Discount: -" + money(order.discount));
  lines.push("Delivery: " + money(order.deliveryFee));
  if (order.codFee > 0) lines.push("COD fee: " + money(order.codFee));
  lines.push("Total: " + money(order.total));
  lines.push("");
  lines.push("Delivery: " + order.deliveryMethod + " (est. " + order.estimatedDelivery + ")");
  lines.push("Payment: " + labelPayment(order.paymentMethod) + " — " + paymentNote(order));
  if (forOwner) {
    lines.push("");
    lines.push("Customer: " + a.fullName);
    lines.push("Phone: " + a.phone);
    lines.push("Address: " + buildAddressLine(a) + " — " + a.city + ", " + a.governorate + ", " + a.country);
    lines.push("");
    lines.push("Open the Orders sheet and update the Status column to finalize this order.");
  } else {
    lines.push("");
    lines.push("We will contact you if anything is needed. Thanks for shopping with " + STORE_NAME + "!");
  }
  return lines.join("\n");
}

function emailHtml(order, forOwner) {
  var a = order.address || {};
  var head = forOwner
    ? "New order " + esc(order.orderNumber)
    : "Thank you for your order, " + esc(a.fullName || "there") + "!";
  var items = (order.lineItems || [])
    .map(function (item) {
      var label = esc(item.name);
      var extras = [];
      if (item.size) extras.push("Size " + esc(item.size));
      if (item.color) extras.push(esc(item.color));
      if (extras.length) label += " (" + extras.join(", ") + ")";
      return "<li>" + label + " &times; " + item.quantity + " &mdash; <strong>" +
        money(item.unitPrice * item.quantity) + "</strong></li>";
    })
    .join("");
  var totals = totRow("Subtotal", money(order.subtotal));
  if (order.discount > 0) totals += totRow("Discount", "-" + money(order.discount));
  totals += totRow("Delivery", money(order.deliveryFee));
  if (order.codFee > 0) totals += totRow("COD fee", money(order.codFee));
  if (order.tax > 0) totals += totRow("Tax", money(order.tax));
  totals += totRow("Total", money(order.total), true);

  var body = "";
  if (forOwner) body += detailRow("Customer", esc(a.fullName || ""));
  if (forOwner) body += detailRow("Phone", esc(a.phone || ""));
  if (forOwner) {
    body += detailRow("Address",
      esc([a.street, a.apartment, a.landmark].filter(Boolean).join(", ")) +
      ", " + esc(a.city) + ", " + esc(a.governorate) + ", " + esc(a.country));
  }
  body += detailRow("Delivery", esc(order.deliveryMethod) + " (est. " + esc(order.estimatedDelivery) + ")");
  body += detailRow("Payment", esc(labelPayment(order.paymentMethod)) + " — " + paymentNote(order));

  var footer = forOwner
    ? "<p>Open the <strong>Orders</strong> tab in the spreadsheet and update the " +
      "<strong>Status</strong> column to finalize this order.</p>"
    : "<p>We will contact you if we need anything. Thanks for shopping with <strong>" +
      esc(STORE_NAME) + "</strong>!</p>";

  return "<div style='font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;max-width:560px'>" +
    "<h2 style='margin:0 0 16px'>" + head + "</h2>" +
    "<h3 style='margin:16px 0 6px'>Items</h3><ul style='margin:0'>" + items + "</ul>" +
    "<table cellpadding='4' cellspacing='0' style='margin-top:12px;border-collapse:collapse'>" +
    totals + "" + body +
    "</table>" + footer +
    "</div>";
}

function totRow(label, value, bold) {
  var strong = bold ? "font-weight:bold" : "";
  return "<tr><td style='padding:2px 12px 2px 0;color:#555'>" + label + "</td>" +
    "<td style='padding:2px 0;white-space:nowrap;" + strong + "'>" + value + "</td></tr>";
}

function detailRow(label, value) {
  return "<tr><td style='padding:2px 12px 2px 0;color:#555'>" + label + "</td>" +
    "<td style='padding:2px 0'>" + value + "</td></tr>";
}

function paymentNote(order) {
  var m = order.paymentMethod;
  if (m === "cod") {
    return "pay " + money(order.total) + " in cash when the order arrives.";
  }
  if (m === "instapay") {
    return "we will contact you with InstaPay transfer instructions to confirm payment.";
  }
  return "we will confirm card payment shortly.";
}