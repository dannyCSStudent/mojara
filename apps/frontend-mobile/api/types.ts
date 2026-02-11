export interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  name: string;
  unit_price: number;
  line_total: number;
}

export interface OrderEvent {
  id: string;
  type:
    | "created"
    | "confirmed"
    | "canceled"
    | "refunded_partial"
    | "refunded_full";
  amount?: number;
  reason?: string;
  created_at: string;
}

export interface Order {
  id: string;
  market_id: string;
  vendor_id: string;
  user_id: string;
  status: "pending" | "confirmed" | "canceled" | "refunded";
  created_at: string;
  items: OrderItem[];
  total: number;
  refunded_total: number;
  refunds: Refund[];
  events: OrderEvent[];
}


// types.ts

export interface Refund {
  id: string;
  amount: number;
  reason?: string;
  created_at: string;
}

export interface IssueRefundPayload {
  amount: number;
  reason?: string;
}

