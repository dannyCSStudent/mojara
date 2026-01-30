export interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  name: string;
  unit_price: number;
  line_total: number;
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
  refunds: {
    id: string;
    amount: number;
    reason?: string;
    created_at: string;
  }[];
  
}
