import { useEffect, useState } from "react";
import { View, Pressable } from "react-native";
import { Screen, AppText } from "../../components";
import {
  fetchNotifications,
  markNotificationRead,
  Notification,
} from "../../api/notifications";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setForbidden(false);

      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err: any) {
      if (err.message === "FORBIDDEN") {
        setForbidden(true);
      } else {
        console.error("Failed to load notifications:", err);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id: string) {
    try {
      setMarkingId(id);
      await markNotificationRead(id);

      // Optimistic UI update
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    } finally {
      setMarkingId(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* ---------- Permission guard ---------- */
  if (forbidden) {
    return (
      <Screen>
        <AppText variant="headline">Access denied</AppText>
        <AppText variant="muted" className="mt-2">
          You do not have permission to view this page.
        </AppText>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <AppText variant="muted">Loading notifications…</AppText>
      </Screen>
    );
  }

  if (notifications.length === 0) {
    return (
      <Screen>
        <AppText variant="muted">No notifications yet</AppText>
      </Screen>
    );
  }

  return (
    <Screen className="gap-4">
      <AppText variant="headline">Notifications</AppText>

      {notifications.map((n) => {
        const unread = !n.read_at;

        return (
          <View
            key={n.id}
            className={`rounded-2xl border p-4 shadow-sm ${
              unread
                ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900"
                : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            }`}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-2">
              <AppText variant="subheading">
                {n.title}
              </AppText>

              {unread && (
                <View className="px-2 py-1 rounded-full bg-blue-600">
                  <AppText className="text-white text-xs font-semibold">
                    NEW
                  </AppText>
                </View>
              )}
            </View>

            {/* Body */}
            <AppText variant="caption" className="mb-3">
              {n.body}
            </AppText>

            {/* Action */}
            {unread && (
              <Pressable
                disabled={markingId === n.id}
                onPress={() => handleMarkRead(n.id)}
                className="mt-2 rounded-xl bg-black dark:bg-white px-4 py-3"
              >
                <AppText className="text-center text-white dark:text-black font-semibold">
                  {markingId === n.id ? "Marking…" : "Mark as read"}
                </AppText>
              </Pressable>
            )}
          </View>
        );
      })}
    </Screen>
  );
}
