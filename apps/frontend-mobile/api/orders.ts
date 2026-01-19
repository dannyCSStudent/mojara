import { apiRequest } from "./client";
import { Order } from "./types";

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
export function fetchVendorOrders(signal?: AbortSignal) {
  return apiRequest<Order[]>(
    "/orders?scope=vendor",
    {
      method: "GET",
      signal,
    }
  );
}
