import { View } from 'react-native';
import { AppText, Screen } from '../../components';
import { usePriceBoard } from '../../hooks/usePriceBoard';

export default function PriceBoard() {
  const { prices, loading, errorMessage } = usePriceBoard();

  return (
    <Screen>
      {/* Header */}
      <AppText variant="headline" className="mb-4">
        Live Market Prices
      </AppText>

      {/* Loading */}
      {loading && <AppText variant="muted">Loading prices…</AppText>}

      {errorMessage ? (
        <View className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <AppText variant="subheading" className="mb-1 text-red-700 dark:text-red-300">
            Unable to load prices
          </AppText>
          <AppText variant="muted" className="text-red-700 dark:text-red-300">
            {errorMessage}
          </AppText>
        </View>
      ) : null}

      {/* Empty state */}
      {!loading && !errorMessage && prices.length === 0 && (
        <View className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <AppText variant="subheading" className="mb-1">
            No active prices
          </AppText>
          <AppText variant="muted">Prices appear when sellers submit recent quotes</AppText>
        </View>
      )}

      {/* Price cards */}
      {!loading &&
        prices.map((p) => {
          const confidencePct = Math.round(p.confidence_score * 100);

          return (
            <View
              key={`${p.market_id}-${p.size_band_id}`}
              className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-black">
              <AppText variant="caption" className="mb-2">
                Market: {p.market_id}
              </AppText>
              {/* Price */}
              <AppText variant="title">${p.reference_price} / kg</AppText>

              {/* Confidence text */}
              <AppText variant="caption" className="mb-2 mt-1">
                Confidence: {confidencePct}%
              </AppText>

              {/* Confidence bar */}
              <View className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <View
                  className={`
                    h-full
                    ${
                      confidencePct >= 80
                        ? 'bg-green-500'
                        : confidencePct >= 60
                          ? 'bg-yellow-400'
                          : 'bg-red-500'
                    }
                  `}
                  style={{ width: `${confidencePct}%` }}
                />
              </View>
            </View>
          );
        })}
    </Screen>
  );
}
