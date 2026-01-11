// api/vendors.ts
import { apiRequest } from "./client";

export type Vendor = {
  id: string;
  name: string;
};

export function fetchVendors(marketId: string) {
  return apiRequest<Vendor[]>(`/markets/${marketId}/vendors`);
}
