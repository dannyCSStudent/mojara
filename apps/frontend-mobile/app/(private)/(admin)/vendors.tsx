import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { AppButton, AppText, EmptyState, LoadingState, Screen } from '../../../components';
import { fetchMarkets, Market } from '../../../api/markets';
import {
  createVendor,
  deleteVendor,
  fetchVendors,
  updateVendor,
  Vendor,
} from '../../../api/vendors';
import { router } from 'expo-router';
import {
  buildAdminVendorLinkedUsersRoute,
  buildAdminVendorProductsRoute,
} from '../../../utils/adminNavigation';

export default function AdminVendorsScreen() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [marketSearch, setMarketSearch] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [newVendorName, setNewVendorName] = useState('');
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loadingMarkets, setLoadingMarkets] = useState(true);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredMarkets = useMemo(() => {
    const query = marketSearch.trim().toLowerCase();
    if (!query) return markets;

    return markets.filter((market) =>
      [market.name, market.location, market.description ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [marketSearch, markets]);

  const selectedMarket = useMemo(
    () => markets.find((market) => market.id === selectedMarketId) ?? null,
    [markets, selectedMarketId]
  );

  useEffect(() => {
    let mounted = true;

    async function loadMarkets() {
      try {
        setLoadingMarkets(true);
        setError(null);
        const data = await fetchMarkets();

        if (!mounted) return;

        setMarkets(data);
        setSelectedMarketId((current) => current ?? data[0]?.id ?? null);
      } catch (err: any) {
        if (mounted) {
          setError(err.message ?? 'Failed to load markets.');
        }
      } finally {
        if (mounted) {
          setLoadingMarkets(false);
        }
      }
    }

    loadMarkets();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedMarketId) {
      setVendors([]);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        setLoadingVendors(true);
        setError(null);
        const data = await fetchVendors(selectedMarketId, vendorSearch);
        if (active) {
          setVendors(data);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message ?? 'Failed to load vendors.');
        }
      } finally {
        if (active) {
          setLoadingVendors(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [selectedMarketId, vendorSearch]);

  async function refreshVendors() {
    if (!selectedMarketId) return;

    setLoadingVendors(true);
    setError(null);

    try {
      const data = await fetchVendors(selectedMarketId, vendorSearch);
      setVendors(data);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load vendors.');
    } finally {
      setLoadingVendors(false);
    }
  }

  async function handleCreateVendor() {
    const name = newVendorName.trim();
    if (!selectedMarketId || !name) return;

    try {
      setSaving(true);
      setError(null);
      const vendor = await createVendor(selectedMarketId, name);
      setVendors((current) => [...current, vendor]);
      setNewVendorName('');
    } catch (err: any) {
      setError(err.message ?? 'Failed to create vendor.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveVendor(vendorId: string) {
    const name = editingName.trim();
    if (!name) return;

    try {
      setSaving(true);
      setError(null);
      const updated = await updateVendor(vendorId, name);
      setVendors((current) => current.map((vendor) => (vendor.id === vendorId ? updated : vendor)));
      setEditingVendorId(null);
      setEditingName('');
    } catch (err: any) {
      setError(err.message ?? 'Failed to update vendor.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDeleteVendor(vendor: Vendor) {
    Alert.alert('Delete vendor', `Delete ${vendor.name}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void handleDeleteVendor(vendor.id);
        },
      },
    ]);
  }

  async function handleDeleteVendor(vendorId: string) {
    try {
      setSaving(true);
      setError(null);
      await deleteVendor(vendorId);
      setVendors((current) => current.filter((vendor) => vendor.id !== vendorId));
      if (editingVendorId === vendorId) {
        setEditingVendorId(null);
        setEditingName('');
      }
    } catch (err: any) {
      setError(err.message ?? 'Failed to delete vendor.');
    } finally {
      setSaving(false);
    }
  }

  if (loadingMarkets) {
    return <LoadingState />;
  }

  if (error && markets.length === 0) {
    return <EmptyState title="Error" description={error} />;
  }

  return (
    <Screen scroll className="pt-6">
      <View className="gap-6 pb-10">
        <View className="gap-2">
          <AppText variant="headline">Admin Vendors</AppText>
          <AppText variant="caption">
            Create, rename, and remove vendors by market using the existing backend vendor
            permissions.
          </AppText>
        </View>

        <View className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <AppText variant="subheading" className="mb-3">
            Markets
          </AppText>
          <View className="rounded-xl border border-gray-300 px-4 py-2 dark:border-gray-700">
            <TextInput
              placeholder="Filter markets..."
              value={marketSearch}
              onChangeText={setMarketSearch}
              autoCapitalize="none"
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4"
            contentContainerStyle={{ gap: 8, paddingRight: 12 }}>
            {filteredMarkets.map((market) => {
              const isSelected = market.id === selectedMarketId;
              return (
                <Pressable
                  key={market.id}
                  onPress={() => setSelectedMarketId(market.id)}
                  className={`rounded-full border px-4 py-2 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300 bg-transparent dark:border-gray-700'
                  }`}>
                  <AppText variant="caption" className={isSelected ? 'text-white' : undefined}>
                    {market.name}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {selectedMarket ? (
          <View className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <AppText variant="subheading">{selectedMarket.name}</AppText>
            <AppText variant="caption" className="mt-1">
              {selectedMarket.location}
            </AppText>

            <View className="mt-4 gap-3">
              <View className="rounded-xl border border-gray-300 px-4 py-2 dark:border-gray-700">
                <TextInput
                  placeholder="Search vendors..."
                  value={vendorSearch}
                  onChangeText={setVendorSearch}
                  autoCapitalize="none"
                />
              </View>

              <View className="rounded-xl border border-dashed border-gray-300 p-4 dark:border-gray-700">
                <AppText variant="caption" className="mb-2">
                  Add vendor to this market
                </AppText>
                <View className="rounded-xl border border-gray-300 px-4 py-2 dark:border-gray-700">
                  <TextInput
                    placeholder="Vendor name"
                    value={newVendorName}
                    onChangeText={setNewVendorName}
                  />
                </View>
                <AppButton
                  className="mt-3"
                  onPress={handleCreateVendor}
                  loading={saving}
                  disabled={!newVendorName.trim()}>
                  Create Vendor
                </AppButton>
              </View>
            </View>
          </View>
        ) : (
          <EmptyState
            title="No markets"
            description="Load or create markets before managing vendors."
          />
        )}

        {error ? (
          <View className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
            <AppText variant="caption" className="text-red-700 dark:text-red-300">
              {error}
            </AppText>
          </View>
        ) : null}

        {loadingVendors ? (
          <LoadingState />
        ) : vendors.length === 0 ? (
          <EmptyState
            title="No vendors found"
            description={
              vendorSearch.trim()
                ? 'Try a different search term or create a new vendor.'
                : 'This market does not have any vendors yet.'
            }
          />
        ) : (
          vendors.map((vendor) => {
            const isEditing = editingVendorId === vendor.id;

            return (
              <View
                key={vendor.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                {isEditing ? (
                  <View className="gap-3">
                    <View className="rounded-xl border border-gray-300 px-4 py-2 dark:border-gray-700">
                      <TextInput value={editingName} onChangeText={setEditingName} />
                    </View>
                    <View className="flex-row gap-3">
                      <AppButton
                        className="flex-1"
                        onPress={() => handleSaveVendor(vendor.id)}
                        loading={saving}
                        disabled={!editingName.trim()}>
                        Save
                      </AppButton>
                      <AppButton
                        className="flex-1"
                        variant="ghost"
                        onPress={() => {
                          setEditingVendorId(null);
                          setEditingName('');
                        }}>
                        Cancel
                      </AppButton>
                    </View>
                  </View>
                ) : (
                  <View className="gap-3">
                    <View className="flex-row items-start justify-between gap-4">
                      <View className="flex-1">
                        <AppText variant="subheading">{vendor.name}</AppText>
                        <AppText variant="caption" className="mt-1">
                          Vendor ID: {vendor.id}
                        </AppText>
                      </View>
                      <View className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">
                        <AppText variant="caption">Active</AppText>
                      </View>
                    </View>

                    <View className="flex-row gap-3">
                      <AppButton
                        className="flex-1"
                        variant="secondary"
                        onPress={() => {
                          setEditingVendorId(vendor.id);
                          setEditingName(vendor.name);
                        }}>
                        Rename
                      </AppButton>
                      <AppButton
                        className="flex-1"
                        variant="ghost"
                        onPress={() => router.push(buildAdminVendorProductsRoute(vendor))}>
                        Products
                      </AppButton>
                    </View>
                    <View className="flex-row gap-3">
                      <AppButton
                        className="flex-1"
                        variant="ghost"
                        onPress={() => router.push(buildAdminVendorLinkedUsersRoute(vendor.id))}>
                        Linked Users
                      </AppButton>
                      <AppButton
                        className="flex-1"
                        variant="danger"
                        onPress={() => confirmDeleteVendor(vendor)}
                        loading={saving}>
                        Delete
                      </AppButton>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}

        <AppButton variant="ghost" onPress={() => void refreshVendors()}>
          Refresh Vendors
        </AppButton>
      </View>
    </Screen>
  );
}
