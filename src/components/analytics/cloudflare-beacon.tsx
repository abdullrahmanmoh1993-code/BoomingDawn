"use client";

import { useEffect } from "react";

const CF_BEACON_URL = "https://static.cloudflareinsights.com/beacon.min.js";
const CF_BEACON_DATA = '{"token":"1f9609b3afa24e32860d31dc0cb1eaec","spa":true}';

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

export function CloudflareBeacon() {
  useEffect(() => {
    const hostname = window.location.hostname;
    if (LOCAL_HOSTNAMES.has(hostname) || hostname.endsWith(".local")) return;
    if (document.querySelector("script[data-cf-beacon]")) return;
    const script = document.createElement("script");
    script.src = CF_BEACON_URL;
    script.setAttribute("data-cf-beacon", CF_BEACON_DATA);
    script.async = true;
    document.head.appendChild(script);
  }, []);
  return null;
}