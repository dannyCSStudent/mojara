
import { apiRequest } from "./client";

/* =========================
   Types
========================= */

export type ActivePriceAgreement = {
  market_id: string;
  size_band_id: string;
  reference_price: number;
  confidence_score: number;
  sample_count: number;
  valid_from: string;   // ISO datetime
  valid_until: string; // ISO datetime
};



export type ActivePrice = {
  market_id: string
  size_band_id: string
  reference_price: number
  confidence_score: number
  sample_count: number
  valid_from: string
  valid_until: string
}

/* =========================
   Queries
========================= */

export function fetchActivePrices() {
  return apiRequest<ActivePriceAgreement[]>(
    "/prices/active"
  );
}

/* =========================
   Admin actions
========================= */

export function lockPriceAgreement(priceId: string) {
  return apiRequest<{ id: string; status: string }>(
    `/admin/prices/${priceId}/lock`,
    { method: "POST" }
  );
}
