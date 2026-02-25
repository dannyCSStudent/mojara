import { apiRequest } from "./client";
import { Order } from "./types";
import { ENV } from "../config/env";

/* =========================
   Types
========================= */

export type CreateOrderItem = {
  product_id: string;
  quantity: number;
};

export type CreateOrderPayload = {
  user_id: string;
  items: CreateOrderItem[];
};

/* =========================
   API
========================= */

export function createOrder(
  marketId: string,
  vendorId: string,
  payload: CreateOrderPayload
) {
  return apiRequest<Order>(
    `/markets/${marketId}/vendors/${vendorId}/orders`,
    {
      method: "POST",
      body: payload,
    }
  );
}

export function confirmOrder(orderId: string) {
  return apiRequest<Order>(
    `/orders/${orderId}/confirm`,
    {
      method: "POST",
    }
  );
}

export function cancelOrder(orderId: string) {
  return apiRequest<Order>(
    `/orders/${orderId}/cancel`,
    {
      method: "POST",
    }
  );
}

export function getOrder(orderId: string) {
  return apiRequest<Order>(
    `/orders/${orderId}`,
    {
      method: "GET",
    }
  );
}

export function fetchMyOrders(): Promise<Order[]> {
  return apiRequest<Order[]>("/orders/me");
}

/**
 * Vendor orders (polling-safe)
 */


export type CursorPaginatedOrders = {
  data: Order[];
  next_cursor: string | null;
};



export type FetchOrdersParams = {
  scope?: "user" | "vendor";
  status?: string;
  sort?: "newest" | "oldest" | "highest";
  cursor?: string | null;
  limit?: number;
  signal?: AbortSignal;
};

export async function fetchOrdersCursor({
  scope = "user",
  status,
  sort = "newest",
  cursor,
  limit = 20,
  signal,
}: FetchOrdersParams) {
  const params = new URLSearchParams();

  params.append("scope", scope);
  params.append("sort", sort);
  params.append("limit", String(limit));

  if (status) params.append("status", status);
  if (cursor) params.append("cursor", cursor);

  if (!ENV) {
  throw new Error("Missing EXPO_PUBLIC_API_URL");
}

  const res = await fetch(
    `${ENV}/orders?${params.toString()}`,
    { signal }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  return res.json();
}



