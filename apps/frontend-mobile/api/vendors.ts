// api/vendors.ts
import { apiRequest } from './client';

export type Vendor = {
  id: string;
  name: string;
  market_id: string;
  created_at: string;
};

export function fetchVendors(marketId: string, search?: string) {
  const query = new URLSearchParams();

  if (search?.trim()) {
    query.set('search', search.trim());
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiRequest<Vendor[]>(`/markets/${marketId}/vendors${suffix}`);
}

export function fetchVendor(vendorId: string) {
  return apiRequest<Vendor>(`/vendors/${vendorId}`);
}

export function createVendor(marketId: string, name: string) {
  return apiRequest<Vendor>(`/markets/${marketId}/vendors`, {
    method: 'POST',
    body: {
      market_id: marketId,
      name,
    },
  });
}

export function updateVendor(vendorId: string, name: string) {
  return apiRequest<Vendor>(`/vendors/${vendorId}`, {
    method: 'PATCH',
    body: { name },
  });
}

export function deleteVendor(vendorId: string) {
  return apiRequest<void>(`/vendors/${vendorId}`, {
    method: 'DELETE',
  });
}
