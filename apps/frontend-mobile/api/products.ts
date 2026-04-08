import { apiRequest } from './client';

export type Product = {
  id: string;
  name: string;
  price: number;
  active: boolean;
  stock_quantity: number;
  is_available: boolean;
  vendor_id: string;
  created_at: string;
};

export type InventoryEvent = {
  id: string;
  product_id: string;
  vendor_id: string;
  market_id: string;
  event_type: 'created' | 'manual_adjustment' | 'decrement' | 'restock' | 'availability_change';
  cause:
    | 'product_created'
    | 'manual_edit'
    | 'manual_availability'
    | 'order_created'
    | 'order_canceled';
  reference_order_id?: string | null;
  stock_quantity_before?: number | null;
  stock_quantity_after?: number | null;
  change_amount?: number | null;
  is_available_before?: boolean | null;
  is_available_after?: boolean | null;
  created_at: string;
};

export type ProductQuery = {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'name' | 'price_asc' | 'price_desc';
};

export function fetchProducts(marketId: string, vendorId: string, queryOptions: ProductQuery = {}) {
  const query = new URLSearchParams();

  if (queryOptions.search?.trim()) {
    query.set('search', queryOptions.search.trim());
  }
  if (queryOptions.minPrice !== undefined) {
    query.set('min_price', String(queryOptions.minPrice));
  }
  if (queryOptions.maxPrice !== undefined) {
    query.set('max_price', String(queryOptions.maxPrice));
  }
  if (queryOptions.sort) {
    query.set('sort', queryOptions.sort);
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';

  return apiRequest<Product[]>(`/markets/${marketId}/vendors/${vendorId}/products${suffix}`);
}

export type ProductCreateInput = {
  name: string;
  price: number;
  active?: boolean;
  stock_quantity?: number;
  is_available?: boolean;
};

export type ProductUpdateInput = {
  name?: string;
  price?: number;
  active?: boolean;
  stock_quantity?: number;
  is_available?: boolean;
};

export type ProductInventoryInput = {
  stock_quantity?: number;
  is_available?: boolean;
};

export function createProduct(marketId: string, vendorId: string, payload: ProductCreateInput) {
  return apiRequest<Product>(`/markets/${marketId}/vendors/${vendorId}/products`, {
    method: 'POST',
    body: payload,
  });
}

export function updateProduct(
  marketId: string,
  vendorId: string,
  productId: string,
  payload: ProductUpdateInput
) {
  return apiRequest<Product>(`/markets/${marketId}/vendors/${vendorId}/products/${productId}`, {
    method: 'PATCH',
    body: payload,
  });
}

export function deleteProduct(marketId: string, vendorId: string, productId: string) {
  return apiRequest<void>(`/markets/${marketId}/vendors/${vendorId}/products/${productId}`, {
    method: 'DELETE',
  });
}

export function updateProductInventory(
  marketId: string,
  vendorId: string,
  productId: string,
  payload: ProductInventoryInput
) {
  return apiRequest<Product>(
    `/markets/${marketId}/vendors/${vendorId}/products/${productId}/inventory`,
    {
      method: 'PATCH',
      body: payload,
    }
  );
}

export function fetchInventoryEvents(
  marketId: string,
  vendorId: string,
  productId: string,
  limit = 10
) {
  return apiRequest<InventoryEvent[]>(
    `/markets/${marketId}/vendors/${vendorId}/products/${productId}/inventory-events?limit=${limit}`
  );
}
