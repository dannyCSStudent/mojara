// api/adminPrices.ts
import { apiRequest } from "./client";

export type AdminPriceAgreement = {
  id: string;
  market_id: string;
  size_band_id: string;
  reference_price: number;
  confidence_score: number;
  sample_count: number;
  status: "draft" | "locked";
  valid_from: string;
  valid_until: string;
};


export function fetchAdminPrices() {
  return apiRequest<AdminPriceAgreement[]>("/admin/prices");
}

export function lockPriceAgreement(id: string) {
  console.log(`Locking price agreement with id: ${id}`);
  return apiRequest<void>(`/admin/prices/${id}/lock`, {
    method: "POST",
  });
}
