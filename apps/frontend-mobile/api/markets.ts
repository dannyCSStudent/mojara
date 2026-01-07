import { apiRequest } from "./client";

export type Market = {
  id: string;
  name: string;
  location: string;
};

export function fetchMarkets() {
  return apiRequest<Market[]>("/markets");
}
