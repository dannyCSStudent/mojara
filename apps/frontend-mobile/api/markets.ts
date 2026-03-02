import { apiRequest } from "./client";
console.log("API client initialized, ready to fetch markets.");
export type Market = {
  id: string;
  name: string;
  location: string;
  description?: string;
};

export function fetchMarkets() {
  return apiRequest<Market[]>("/markets");
}
