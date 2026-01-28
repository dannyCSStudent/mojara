import { View } from "react-native"
import { AppText, Screen } from "../../components"
import { usePriceBoard } from "../../hooks/usePriceBoard"

export default function PriceBoard({ marketId }: { marketId: string }) {
  const { prices, loading } = usePriceBoard(marketId)

  return (
    <Screen>
      {/* Header */}
      <AppText variant="headline" className="mb-4">
        Live Market Prices
      </AppText>

      {/* Loading */}
      {loading && (
        <AppText variant="muted">
          Loading prices…
        </AppText>
      )}

      {/* Empty state */}
      {!loading && prices.length === 0 && (
        <View className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
          <AppText variant="subheading" className="mb-1">
            No active prices
          </AppText>
          <AppText variant="muted">
            Prices appear when sellers submit recent quotes
          </AppText>
        </View>
      )}

      {/* Price cards */}
      {!loading &&
        prices.map((p) => {
          const confidencePct = Math.round(p.confidence_score * 100)

          return (
            <View
              key={p.size_band_id}
              className="mb-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4 shadow-sm"
            >
              {/* Price */}
              <AppText variant="title">
                ${p.reference_price} / kg
              </AppText>

              {/* Confidence text */}
              <AppText variant="caption" className="mt-1 mb-2">
                Confidence: {confidencePct}%
              </AppText>

              {/* Confidence bar */}
              <View className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <View
                  className={`
                    h-full
                    ${
                      confidencePct >= 80
                        ? "bg-green-500"
                        : confidencePct >= 60
                        ? "bg-yellow-400"
                        : "bg-red-500"
                    }
                  `}
                  style={{ width: `${confidencePct}%` }}
                />
              </View>
            </View>
          )
        })}
    </Screen>
  )
}
