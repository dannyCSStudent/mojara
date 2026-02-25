// packages/types/src/dashboard.ts

export type AdminOverview = {
  total_orders_7d: number
  orders_today: number
  active_vendors: number
  active_price_agreements: number
  pending_orders: number
}

export type OrdersTrendPoint = {
  date: string
  count: number
}
