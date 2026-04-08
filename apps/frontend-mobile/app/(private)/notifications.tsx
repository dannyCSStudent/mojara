import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Screen, AppText } from '../../components';
import {
  fetchNotifications,
  markNotificationRead,
  Notification,
  fetchUnreadCount,
  fetchNotificationSubscriptions,
  createNotificationSubscription,
  deleteNotificationSubscription,
  NotificationSubscription,
  markAllNotificationsRead,
} from '../../api/notifications';
import { useFocusEffect } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { fetchVendors, Vendor } from '../../api/vendors';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [subscriptions, setSubscriptions] = useState<NotificationSubscription[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [knownVendors, setKnownVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [savingSubscription, setSavingSubscription] = useState(false);
  const [deletingSubscriptionId, setDeletingSubscriptionId] = useState<string | null>(null);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [preferencesMarketFilter, setPreferencesMarketFilter] = useState<string>('all');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<'price_increase' | 'price_decrease'>(
    'price_increase'
  );
  const [selectedSeverity, setSelectedSeverity] = useState(1);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hydratedVendorMarketIdsRef = useRef<Set<string>>(new Set());
  const setUnreadCount = useAppStore((s) => s.setUnreadCount);
  const markets = useAppStore((s) => s.markets);
  const loadMarkets = useAppStore((s) => s.loadMarkets);
  const subscriptionsByMarket = useAppStore((s) => s.subscriptions);

  const availableMarkets = useMemo(
    () => markets.filter((market) => subscriptionsByMarket.includes(market.id)),
    [markets, subscriptionsByMarket]
  );
  const vendorNameById = useMemo(
    () =>
      Object.fromEntries(knownVendors.map((vendor) => [vendor.id, vendor.name])) as Record<
        string,
        string
      >,
    [knownVendors]
  );
  const vendorMarketIdById = useMemo(
    () =>
      Object.fromEntries(knownVendors.map((vendor) => [vendor.id, vendor.market_id])) as Record<
        string,
        string
      >,
    [knownVendors]
  );
  const marketNameById = useMemo(
    () =>
      Object.fromEntries(markets.map((market) => [market.id, market.name])) as Record<
        string,
        string
      >,
    [markets]
  );
  const filteredSubscriptions = useMemo(
    () =>
      subscriptions.filter((subscription) => {
        if (preferencesMarketFilter === 'all') {
          return true;
        }

        return vendorMarketIdById[subscription.vendor_id] === preferencesMarketFilter;
      }),
    [subscriptions, preferencesMarketFilter, vendorMarketIdById]
  );
  const groupedSubscriptions = useMemo(() => {
    const groups = new Map<string, NotificationSubscription[]>();

    for (const subscription of filteredSubscriptions) {
      const marketId = vendorMarketIdById[subscription.vendor_id] ?? 'unknown';
      const current = groups.get(marketId) ?? [];
      current.push(subscription);
      groups.set(marketId, current);
    }

    return Array.from(groups.entries());
  }, [filteredSubscriptions, vendorMarketIdById]);
  const hasDuplicateSelection = useMemo(
    () =>
      subscriptions.some(
        (subscription) =>
          subscription.vendor_id === selectedVendorId &&
          subscription.event_type === selectedEventType &&
          subscription.min_severity === selectedSeverity &&
          subscription.channel === 'push'
      ),
    [subscriptions, selectedVendorId, selectedEventType, selectedSeverity]
  );

  const refreshUnread = useCallback(async () => {
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to refresh unread count', err);
    }
  }, [setUnreadCount]);

  useFocusEffect(
    useCallback(() => {
      refreshUnread();
    }, [refreshUnread])
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setForbidden(false);
      setErrorMessage(null);

      await loadMarkets();
      const [notificationData, subscriptionData] = await Promise.all([
        fetchNotifications(),
        fetchNotificationSubscriptions(),
      ]);
      setNotifications(notificationData);
      setSubscriptions(subscriptionData);
    } catch (err: any) {
      if (err.message === 'FORBIDDEN') {
        setForbidden(true);
      } else {
        setErrorMessage(err.message ?? 'Failed to load notifications.');
      }
    } finally {
      setLoading(false);
    }
  }, [loadMarkets]);

  async function handleMarkRead(id: string) {
    try {
      setMarkingId(id);
      await markNotificationRead(id);

      // Optimistic UI update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      await refreshUnread();
    } catch {
      setErrorMessage('Failed to mark notification read.');
    } finally {
      setMarkingId(null);
    }
  }

  async function loadVendors(marketId: string) {
    try {
      setErrorMessage(null);
      const data = await fetchVendors(marketId);
      setVendors(data);
      setKnownVendors((current) => {
        const merged = new Map(current.map((vendor) => [vendor.id, vendor]));
        for (const vendor of data) {
          merged.set(vendor.id, vendor);
        }
        return Array.from(merged.values());
      });
      setSelectedVendorId((current) =>
        current && data.some((vendor) => vendor.id === current) ? current : (data[0]?.id ?? null)
      );
    } catch (err: any) {
      setErrorMessage(err.message ?? 'Failed to load vendors.');
      setVendors([]);
      setSelectedVendorId(null);
    }
  }

  useEffect(() => {
    if (availableMarkets.length > 0 && !selectedMarketId) {
      setSelectedMarketId(availableMarkets[0].id);
    }
  }, [availableMarkets, selectedMarketId]);

  useEffect(() => {
    if (!selectedMarketId) {
      setVendors([]);
      setSelectedVendorId(null);
      return;
    }

    void loadVendors(selectedMarketId);
  }, [selectedMarketId]);

  useEffect(() => {
    if (availableMarkets.length === 0) {
      return;
    }

    const pendingMarkets = availableMarkets.filter(
      (market) => !hydratedVendorMarketIdsRef.current.has(market.id)
    );

    if (pendingMarkets.length === 0) {
      return;
    }

    let active = true;

    async function hydrateKnownVendors() {
      try {
        const vendorGroups = await Promise.all(
          pendingMarkets.map((market) => fetchVendors(market.id).catch(() => []))
        );

        if (!active) {
          return;
        }

        for (const market of pendingMarkets) {
          hydratedVendorMarketIdsRef.current.add(market.id);
        }

        setKnownVendors((current) => {
          const merged = new Map(current.map((vendor) => [vendor.id, vendor]));
          for (const vendor of vendorGroups.flat()) {
            merged.set(vendor.id, vendor);
          }
          return Array.from(merged.values());
        });
      } catch {
        // Ignore vendor-name hydration failures; the screen falls back to short IDs.
      }
    }

    void hydrateKnownVendors();

    return () => {
      active = false;
    };
  }, [availableMarkets]);

  async function handleCreateSubscription() {
    if (!selectedVendorId) {
      setErrorMessage('Select a vendor before creating a preference.');
      return;
    }

    if (hasDuplicateSelection) {
      setErrorMessage('That alert preference already exists.');
      return;
    }

    try {
      setSavingSubscription(true);
      setErrorMessage(null);
      const created = await createNotificationSubscription({
        vendor_id: selectedVendorId,
        event_type: selectedEventType,
        min_severity: selectedSeverity,
        channel: 'push',
      });
      setSubscriptions((current) => [created, ...current]);
    } catch (err: any) {
      setErrorMessage(err.message ?? 'Failed to create preference.');
    } finally {
      setSavingSubscription(false);
    }
  }

  async function handleDeleteSubscription(id: string) {
    try {
      setDeletingSubscriptionId(id);
      setErrorMessage(null);
      await deleteNotificationSubscription(id);
      setSubscriptions((current) => current.filter((item) => item.id !== id));
    } catch (err: any) {
      setErrorMessage(err.message ?? 'Failed to delete preference.');
    } finally {
      setDeletingSubscriptionId(null);
    }
  }

  async function handleMarkAllRead() {
    try {
      setMarkingAllRead(true);
      setErrorMessage(null);
      await markAllNotificationsRead();
      const timestamp = new Date().toISOString();
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read_at: notification.read_at ?? timestamp,
        }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      setErrorMessage(err.message ?? 'Failed to mark all notifications read.');
    } finally {
      setMarkingAllRead(false);
    }
  }

  useEffect(() => {
    void load();
  }, [load]);

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

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <AppText variant="headline">Notifications</AppText>
            {notifications.some((notification) => !notification.read_at) ? (
              <Pressable
                disabled={markingAllRead}
                onPress={() => void handleMarkAllRead()}
                className="rounded-xl bg-black px-4 py-3 dark:bg-white">
                <AppText className="text-center font-semibold text-white dark:text-black">
                  {markingAllRead ? 'Marking…' : 'Mark all read'}
                </AppText>
              </Pressable>
            ) : null}
          </View>

          <View className="gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <AppText variant="subheading">Alert Preferences</AppText>
            <AppText variant="caption">
              Subscribe to vendor price alerts by market, event type, and minimum severity.
            </AppText>

            {availableMarkets.length > 0 ? (
              <>
                <View className="flex-row flex-wrap gap-2">
                  {availableMarkets.map((market) => {
                    const active = selectedMarketId === market.id;
                    return (
                      <Pressable
                        key={market.id}
                        onPress={() => setSelectedMarketId(market.id)}
                        className={`rounded-full border px-3 py-2 ${
                          active
                            ? 'border-black bg-black dark:border-white dark:bg-white'
                            : 'border-gray-300 dark:border-gray-700'
                        }`}>
                        <AppText className={active ? 'text-white dark:text-black' : ''}>
                          {market.name}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>

                {vendors.length > 0 ? (
                  <View className="gap-2">
                    <AppText variant="caption">Vendor</AppText>
                    <View className="flex-row flex-wrap gap-2">
                      {vendors.map((vendor) => {
                        const active = selectedVendorId === vendor.id;
                        return (
                          <Pressable
                            key={vendor.id}
                            onPress={() => setSelectedVendorId(vendor.id)}
                            className={`rounded-full border px-3 py-2 ${
                              active
                                ? 'border-black bg-black dark:border-white dark:bg-white'
                                : 'border-gray-300 dark:border-gray-700'
                            }`}>
                            <AppText className={active ? 'text-white dark:text-black' : ''}>
                              {vendor.name}
                            </AppText>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : (
                  <AppText variant="caption">No vendors available in this market.</AppText>
                )}

                <View className="gap-2">
                  <AppText variant="caption">Event Type</AppText>
                  <View className="flex-row gap-2">
                    {(['price_increase', 'price_decrease'] as const).map((eventType) => {
                      const active = selectedEventType === eventType;
                      return (
                        <Pressable
                          key={eventType}
                          onPress={() => setSelectedEventType(eventType)}
                          className={`rounded-full border px-3 py-2 ${
                            active
                              ? 'border-black bg-black dark:border-white dark:bg-white'
                              : 'border-gray-300 dark:border-gray-700'
                          }`}>
                          <AppText className={active ? 'text-white dark:text-black' : ''}>
                            {eventType === 'price_increase' ? 'Price Increase' : 'Price Decrease'}
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View className="gap-2">
                  <AppText variant="caption">Minimum Severity</AppText>
                  <View className="flex-row gap-2">
                    {[1, 2, 3, 4, 5].map((level) => {
                      const active = selectedSeverity === level;
                      return (
                        <Pressable
                          key={level}
                          onPress={() => setSelectedSeverity(level)}
                          className={`rounded-full border px-3 py-2 ${
                            active
                              ? 'border-black bg-black dark:border-white dark:bg-white'
                              : 'border-gray-300 dark:border-gray-700'
                          }`}>
                          <AppText className={active ? 'text-white dark:text-black' : ''}>
                            {level}
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <Pressable
                  disabled={savingSubscription || !selectedVendorId || hasDuplicateSelection}
                  onPress={() => void handleCreateSubscription()}
                  className={`rounded-xl px-4 py-3 ${
                    savingSubscription || !selectedVendorId || hasDuplicateSelection
                      ? 'bg-gray-300 dark:bg-gray-700'
                      : 'bg-black dark:bg-white'
                  }`}>
                  <AppText
                    className={`text-center font-semibold ${
                      savingSubscription || !selectedVendorId || hasDuplicateSelection
                        ? 'text-gray-600 dark:text-gray-300'
                        : 'text-white dark:text-black'
                    }`}>
                    {savingSubscription
                      ? 'Saving…'
                      : hasDuplicateSelection
                        ? 'Preference Already Added'
                        : 'Add Preference'}
                  </AppText>
                </Pressable>

                {hasDuplicateSelection ? (
                  <AppText variant="caption">
                    This vendor, event type, and severity combination is already in your saved
                    preferences.
                  </AppText>
                ) : null}
              </>
            ) : (
              <AppText variant="caption">
                Subscribe to at least one market before creating notification preferences.
              </AppText>
            )}
          </View>

          <View className="gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <AppText variant="subheading">Current Preferences</AppText>
            {subscriptions.length === 0 ? (
              <AppText variant="caption">No alert preferences configured yet.</AppText>
            ) : (
              <>
                <View className="flex-row flex-wrap gap-2">
                  <Pressable
                    onPress={() => setPreferencesMarketFilter('all')}
                    className={`rounded-full border px-3 py-2 ${
                      preferencesMarketFilter === 'all'
                        ? 'border-black bg-black dark:border-white dark:bg-white'
                        : 'border-gray-300 dark:border-gray-700'
                    }`}>
                    <AppText
                      className={
                        preferencesMarketFilter === 'all' ? 'text-white dark:text-black' : ''
                      }>
                      All Markets
                    </AppText>
                  </Pressable>

                  {availableMarkets.map((market) => {
                    const active = preferencesMarketFilter === market.id;
                    return (
                      <Pressable
                        key={market.id}
                        onPress={() => setPreferencesMarketFilter(market.id)}
                        className={`rounded-full border px-3 py-2 ${
                          active
                            ? 'border-black bg-black dark:border-white dark:bg-white'
                            : 'border-gray-300 dark:border-gray-700'
                        }`}>
                        <AppText className={active ? 'text-white dark:text-black' : ''}>
                          {market.name}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>

                {groupedSubscriptions.length === 0 ? (
                  <AppText variant="caption">
                    No saved preferences match this market filter.
                  </AppText>
                ) : (
                  groupedSubscriptions.map(([marketId, marketSubscriptions]) => (
                    <View key={marketId} className="gap-2">
                      <AppText variant="caption" className="uppercase">
                        {marketNameById[marketId] ?? 'Other Vendors'}
                      </AppText>

                      {marketSubscriptions.map((subscription) => (
                        <View
                          key={subscription.id}
                          className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
                          <AppText variant="body">
                            {vendorNameById[subscription.vendor_id] ??
                              `Vendor ${subscription.vendor_id.slice(0, 8)}`}{' '}
                            · {subscription.event_type.replace('_', ' ')}
                          </AppText>
                          <AppText variant="caption">
                            Min severity {subscription.min_severity} · Channel{' '}
                            {subscription.channel}
                          </AppText>
                          <Pressable
                            disabled={deletingSubscriptionId === subscription.id}
                            onPress={() => void handleDeleteSubscription(subscription.id)}
                            className="mt-3 rounded-xl border border-red-300 px-4 py-2">
                            <AppText className="text-center text-red-600">
                              {deletingSubscriptionId === subscription.id ? 'Removing…' : 'Remove'}
                            </AppText>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  ))
                )}
              </>
            )}
          </View>

          {errorMessage ? (
            <View className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
              <AppText variant="caption" className="text-red-700 dark:text-red-300">
                {errorMessage}
              </AppText>
            </View>
          ) : null}

          {notifications.length === 0 ? (
            <View className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <AppText variant="muted">No notifications yet</AppText>
            </View>
          ) : (
            notifications.map((n) => {
              const unread = !n.read_at;

              return (
                <View
                  key={n.id}
                  className={`rounded-2xl border p-4 shadow-sm ${
                    unread
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900'
                      : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
                  }`}>
                  {/* Header */}
                  <View className="mb-2 flex-row items-center justify-between">
                    <AppText variant="subheading">{n.title}</AppText>

                    {unread && (
                      <View className="rounded-full bg-blue-600 px-2 py-1">
                        <AppText className="text-xs font-semibold text-white">NEW</AppText>
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
                      className="mt-2 rounded-xl bg-black px-4 py-3 dark:bg-white">
                      <AppText className="text-center font-semibold text-white dark:text-black">
                        {markingId === n.id ? 'Marking…' : 'Mark as read'}
                      </AppText>
                    </Pressable>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
