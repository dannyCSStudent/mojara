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

export type OrdersSummary = {
  total_orders: number;
  pending: number;
  confirmed: number;
  canceled: number;
  total_revenue: number;
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
  search?: string;
  cursor?: string | null;
  limit?: number;
  signal?: AbortSignal;
};

export async function fetchOrdersCursor(
  params: FetchOrdersParams
): Promise<CursorPaginatedOrders> {
  const query = new URLSearchParams();

  if (params.scope) query.append("scope", params.scope);
  if (params.status) query.append("status", params.status);
  if (params.sort) query.append("sort", params.sort);
  if (params.search) query.append("search", params.search);
  if (params.cursor) query.append("cursor", params.cursor);
  if (params.limit) query.append("limit", String(params.limit));

  const endpoint = `/orders?${query.toString()}`;

  console.log("Fetching orders from:", `${ENV.API_URL}${endpoint}`);

  return apiRequest<CursorPaginatedOrders>(endpoint);
}


export async function fetchOrdersSummary(
  scope: "vendor" | "user"
): Promise<OrdersSummary> {
  return apiRequest<OrdersSummary>(
    `/orders/summary?scope=${scope}`
  );
}
