export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  market_id: string;
  vendor_id: string;
  user_id: string;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  items: OrderItem[];
}
