// api/adminPrices.ts
import { ApiError, apiRequest } from './client';

export type AdminPriceAgreement = {
  id: string;
  market_id: string;
  size_band_id: string;
  reference_price: number;
  confidence_score: number;
  sample_count: number;
  status: 'draft' | 'locked';
  valid_from: string;
  valid_until: string;
};

export type AdminPriceExplainRow = {
  market_id: string;
  size_band: string;
  reference_price: number;
  confidence_score: number;
  sample_count: number;
  status: 'draft' | 'locked';
  valid_from: string;
  valid_until: string;
  created_at: string;
};

function handleForbidden(err: any): never {
  if (err instanceof ApiError && err.status === 403) {
    throw new Error('FORBIDDEN');
  }
  throw err;
}

export async function fetchAdminPrices(
  options: {
    status?: 'draft' | 'locked';
    marketId?: string;
  } = {}
): Promise<AdminPriceAgreement[]> {
  try {
    const query = new URLSearchParams();
    if (options.status) {
      query.set('status', options.status);
    }
    if (options.marketId) {
      query.set('market_id', options.marketId);
    }

    const suffix = query.toString() ? `?${query.toString()}` : '';
    return await apiRequest<AdminPriceAgreement[]>(`/admin/prices${suffix}`);
  } catch (err) {
    handleForbidden(err);
  }
}

export async function fetchAdminPriceExplain(marketId: string): Promise<AdminPriceExplainRow[]> {
  try {
    return await apiRequest<AdminPriceExplainRow[]>(
      `/admin/prices/explain?market_id=${encodeURIComponent(marketId)}`
    );
  } catch (err) {
    handleForbidden(err);
  }
}

export async function lockPriceAgreement(id: string): Promise<void> {
  try {
    return await apiRequest<void>(`/admin/prices/${id}/lock`, {
      method: 'POST',
    });
  } catch (err) {
    handleForbidden(err);
  }
}
