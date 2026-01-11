import { apiRequest } from "./client";

export type Product = {
  id: string;
  name: string;
  price: number;
};

export function fetchProducts(
  marketId: string,
  vendorId: string
) {
  return apiRequest<Product[]>(
    `/markets/${marketId}/vendors/${vendorId}/products`
  );
}
