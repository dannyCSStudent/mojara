import { useEffect, useState, useCallback } from "react";
import { View, Pressable, ActivityIndicator, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen, AppText } from "../../../../components";
import { fetchProducts, Product } from "../../../../api/products";
import { useCartStore } from "../../../../store/useCartStore";

export default function VendorProductsScreen() {
  const router = useRouter();
  const { marketId, vendorId } = useLocalSearchParams<{
    marketId: string;
    vendorId: string;
  }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const initCart = useCartStore((s) => s.initCart);
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems());
  const totalPrice = useCartStore((s) => s.totalPrice());

  /* ✅ stable initializer */
  const setupCart = useCallback(() => {
    if (!marketId || !vendorId) return;
    initCart(marketId, vendorId);
  }, [marketId, vendorId, initCart]);

  useEffect(() => {
    if (!marketId || !vendorId) return;

    setupCart();

    fetchProducts(marketId, vendorId)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [marketId, vendorId, setupCart]);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator />
      </Screen>
    );
  }

  return (
    <Screen className="gap-4 pb-24">
      <AppText variant="title">Products</AppText>

      {products.map((p) => (
        <View
          key={p.id}
          className="border rounded-xl p-4 flex-row justify-between items-center"
        >
          <View>
            <AppText>{p.name}</AppText>
            <AppText>${p.price.toFixed(2)}</AppText>
          </View>

          <Pressable
            onPress={() =>
              addItem({
                product_id: p.id,
                name: p.name,
                price: p.price,
              })
            }
            className="bg-black px-4 py-2 rounded-lg"
          >
            <AppText className="text-white">Add</AppText>
          </Pressable>
        </View>
      ))}

      {/* ✅ Cart Bar */}
      {totalItems > 0 && (
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/checkout",
              params: {
                marketId,
                vendorId,
                items: JSON.stringify(items),
              },
            })
          }
          className="absolute bottom-4 left-4 right-4 bg-black rounded-xl p-4"
        >
          <Text className="text-white text-center font-semibold">
            Checkout ({totalItems} items) · ${totalPrice.toFixed(2)}
          </Text>
        </Pressable>
      )}
    </Screen>
  );
}
