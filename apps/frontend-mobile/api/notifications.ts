// api/notifications.ts

import { ApiError, apiRequest } from './client';

export type Notification = {
  id: string;
  event_type: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type NotificationSubscription = {
  id: string;
  user_id: string;
  vendor_id: string;
  event_type: 'price_increase' | 'price_decrease';
  min_severity: number;
  channel: 'push' | 'whatsapp';
  active: boolean;
  created_at: string;
};

export type NotificationSubscriptionInput = {
  vendor_id: string;
  event_type: 'price_increase' | 'price_decrease';
  min_severity: number;
  channel?: 'push' | 'whatsapp';
};

type UnreadCountResponse = {
  count: number;
};

function handleForbidden(err: unknown): never {
  if (err instanceof ApiError && err.status === 403) {
    throw new Error('FORBIDDEN');
  }

  throw err;
}

export async function fetchNotifications() {
  try {
    return await apiRequest<Notification[]>('/notifications');
  } catch (err) {
    handleForbidden(err);
  }
}

export async function fetchNotificationSubscriptions() {
  try {
    return await apiRequest<NotificationSubscription[]>('/notifications/subscriptions');
  } catch (err) {
    handleForbidden(err);
  }
}

export function createNotificationSubscription(payload: NotificationSubscriptionInput) {
  return apiRequest<NotificationSubscription>('/notifications/subscriptions', {
    method: 'POST',
    body: payload,
  });
}

export function deleteNotificationSubscription(id: string) {
  return apiRequest<{ ok: true }>(`/notifications/subscriptions/${id}`, {
    method: 'DELETE',
  });
}

export function markNotificationRead(id: string) {
  return apiRequest(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export function markAllNotificationsRead() {
  return apiRequest<{ ok: true; updated: number }>('/notifications/read-all', {
    method: 'PATCH',
  });
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await apiRequest<UnreadCountResponse>('/notifications/unread-count');

  return res.count;
}
