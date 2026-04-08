import { apiRequest } from './client';
import { AdminOverview, OrdersTrendPoint } from '@repo/types';

export function fetchAdminOverview() {
  return apiRequest<AdminOverview>('/dashboard/admin/overview');
}

export function fetchAdminOrdersTrend() {
  return apiRequest<OrdersTrendPoint[]>('/dashboard/admin/orders-trend');
}
