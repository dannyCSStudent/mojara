export function normalizeNotificationMarketSelection(params: {
  availableMarketIds: string[];
  selectedMarketId: string | null;
  preferencesMarketFilter: string;
}) {
  const available = new Set(params.availableMarketIds);

  const selectedMarketId =
    params.selectedMarketId && available.has(params.selectedMarketId)
      ? params.selectedMarketId
      : (params.availableMarketIds[0] ?? null);

  const preferencesMarketFilter =
    params.preferencesMarketFilter === 'all' || available.has(params.preferencesMarketFilter)
      ? params.preferencesMarketFilter
      : 'all';

  return {
    selectedMarketId,
    preferencesMarketFilter,
  };
}
