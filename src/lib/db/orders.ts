import { env } from "cloudflare:workers";
import type { Order, OrderLineItem } from "@/lib/types";

const INSERT_ORDER_SQL = `
  INSERT INTO orders (
    order_number, full_name, email, phone, country, governorate, city, street,
    apartment, landmark, postal_code, instructions,
    delivery_method, payment_method, payment_status, order_status,
    subtotal, discount, delivery_fee, cod_fee, tax, total,
    estimated_delivery, created_at
  ) VALUES (
    ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8,
    ?9, ?10, ?11, ?12,
    ?13, ?14, ?15, ?16,
    ?17, ?18, ?19, ?20, ?21, ?22,
    ?23, ?24
  )
`;

export function orderInsert(order: Order) {
  const a = order.address;
  return env.DB.prepare(INSERT_ORDER_SQL).bind(
    order.orderNumber,
    a.fullName,
    a.email,
    a.phone,
    a.country,
    a.governorate,
    a.city,
    a.street,
    a.apartment ?? null,
    a.landmark ?? null,
    a.postalCode ?? null,
    a.instructions ?? null,
    order.deliveryMethod,
    order.paymentMethod,
    order.paymentStatus,
    order.orderStatus,
    order.subtotal,
    order.discount,
    order.deliveryFee,
    order.codFee,
    order.tax,
    order.total,
    order.estimatedDelivery,
    order.createdAt
  );
}

export function orderItemInserts(order: Order) {
  return order.lineItems.map((item: OrderLineItem) =>
    env.DB.prepare(
      `INSERT INTO order_items (
        order_number, product_id, variant_id, quantity,
        name, size, color, unit_price, image
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
    ).bind(
      order.orderNumber,
      item.productId,
      item.variantId,
      item.quantity,
      item.name,
      item.size ?? null,
      item.color ?? null,
      item.unitPrice,
      item.image
    )
  );
}

/**
 * Persist an order and its line items to D1 in a single atomic batch.
 * Throws if the write fails, so callers can return an error response.
 */
export async function persistOrder(order: Order): Promise<void> {
  await env.DB.batch([orderInsert(order), ...orderItemInserts(order)]);
}