// api/notifications.ts

import { apiRequest } from "./client";

export type Notification = {
  id: string;
  event_type: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export function fetchNotifications() {
  return apiRequest<Notification[]>("/notifications");
}

export function markNotificationRead(id: string) {
  return apiRequest(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}
