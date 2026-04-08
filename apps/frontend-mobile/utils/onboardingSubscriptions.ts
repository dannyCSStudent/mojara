export function getMissingMarketSubscriptions(params: {
  selectedMarketIds: string[];
  existingMarketIds: string[];
}) {
  const existing = new Set(params.existingMarketIds);
  const seen = new Set<string>();
  const missing: string[] = [];

  for (const marketId of params.selectedMarketIds) {
    if (seen.has(marketId)) {
      continue;
    }
    seen.add(marketId);

    if (!existing.has(marketId)) {
      missing.push(marketId);
    }
  }

  return missing;
}
