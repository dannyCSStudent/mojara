import { useEffect, useState } from "react";
import { Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen, AppText } from "../../../components";
import { fetchVendors, Vendor } from "../../../api/vendors";

export default function MarketVendorsScreen() {
  const router = useRouter();
  const { marketId } = useLocalSearchParams<{ marketId: string }>();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!marketId) return;

    fetchVendors(marketId)
      .then(setVendors)
      .finally(() => setLoading(false));
  }, [marketId]);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator />
      </Screen>
    );
  }

  return (
    <Screen className="gap-4">
      <AppText variant="title">Vendors</AppText>

      {vendors.length === 0 ? (
        <AppText>No vendors found.</AppText>
      ) : (
        vendors.map((vendor) => (
          <Pressable
            key={vendor.id}
            onPress={() =>
              router.push(
                `/(private)/markets/${marketId}/vendors/${vendor.id}`
              )
            }
            className="border rounded-xl p-4"
          >
            <AppText variant="body">{vendor.name}</AppText>
          </Pressable>
        ))
      )}
    </Screen>
  );
}
