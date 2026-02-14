import { apiRequest } from "./client";

export type Market = {
  id: string;
  name: string;
  location: string;
  description?: string;
};

export function fetchMarkets() {
  return apiRequest<Market[]>("/markets");
}
