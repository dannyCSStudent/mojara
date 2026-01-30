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

function handleForbidden(err: any): never {
  if (err?.response?.status === 403) {
    throw new Error("FORBIDDEN");
  }
  throw err;
}


export async function fetchAdminPrices(): Promise<AdminPriceAgreement[]> {
  try {
    return await apiRequest<AdminPriceAgreement[]>("/admin/prices");
  } catch (err) {
    handleForbidden(err);
  }
}


export async function lockPriceAgreement(id: string): Promise<void> {
  try {
    return await apiRequest<void>(`/admin/prices/${id}/lock`, {
      method: "POST",
    });
  } catch (err) {
    handleForbidden(err);
  }
}

