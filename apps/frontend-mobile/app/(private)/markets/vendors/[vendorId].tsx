import { useEffect, useState, useCallback } from 'react';
import { View, Pressable, ActivityIndicator, Text, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, AppText, EmptyState } from '../../../../components';
import { fetchProducts, Product } from '../../../../api/products';
import { useCartStore } from '../../../../store/useCartStore';

export default function VendorProductsScreen() {
  const router = useRouter();
  const { marketId, vendorId } = useLocalSearchParams<{
    marketId: string;
    vendorId: string;
  }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState<'name' | 'price_asc' | 'price_desc'>('name');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const initCart = useCartStore((s) => s.initCart);
  const addItem = useCartStore((s) => s.addItem);
  const totalItems = useCartStore((s) => s.totalItems);
  const totalPrice = useCartStore((s) => s.totalPrice);

  /* ✅ stable initializer */
  const setupCart = useCallback(() => {
    if (!marketId || !vendorId) return;
    initCart(marketId, vendorId);
  }, [marketId, vendorId, initCart]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!marketId || !vendorId) return;

    setupCart();
    setLoading(true);

    const parsedMinPrice = minPrice.trim() === '' ? undefined : Number(minPrice);
    const parsedMaxPrice = maxPrice.trim() === '' ? undefined : Number(maxPrice);

    fetchProducts(marketId, vendorId, {
      search: debouncedSearch,
      minPrice:
        parsedMinPrice !== undefined && !Number.isNaN(parsedMinPrice) ? parsedMinPrice : undefined,
      maxPrice:
        parsedMaxPrice !== undefined && !Number.isNaN(parsedMaxPrice) ? parsedMaxPrice : undefined,
      sort,
    })
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [marketId, vendorId, setupCart, debouncedSearch, minPrice, maxPrice, sort]);

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

      <View className="rounded-xl border border-gray-300 px-4 py-2">
        <TextInput
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      <View className="flex-row gap-2">
        <View className="flex-1 rounded-xl border border-gray-300 px-4 py-2">
          <TextInput
            placeholder="Min price"
            value={minPrice}
            onChangeText={setMinPrice}
            keyboardType="numeric"
          />
        </View>
        <View className="flex-1 rounded-xl border border-gray-300 px-4 py-2">
          <TextInput
            placeholder="Max price"
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View className="flex-row gap-2">
        {[
          { label: 'Name', value: 'name' },
          { label: 'Price ↑', value: 'price_asc' },
          { label: 'Price ↓', value: 'price_desc' },
        ].map((option) => {
          const active = sort === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => setSort(option.value as 'name' | 'price_asc' | 'price_desc')}
              className={`rounded-full border px-3 py-2 ${
                active ? 'border-black bg-black' : 'border-gray-300'
              }`}>
              <AppText className={active ? 'text-white' : ''}>{option.label}</AppText>
            </Pressable>
          );
        })}
      </View>

      {products.length === 0 && (
        <EmptyState title="No Products Found" description="Adjust the search or price filters." />
      )}

      {products.map((p) => (
        <View key={p.id} className="flex-row items-center justify-between rounded-xl border p-4">
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
            className="rounded-lg bg-black px-4 py-2">
            <AppText className="text-white">Add</AppText>
          </Pressable>
        </View>
      ))}

      {/* ✅ Floating Cart Bar */}
      {totalItems > 0 && (
        <Pressable
          onPress={() => router.push('/checkout')}
          className="absolute bottom-4 left-4 right-4 rounded-xl bg-black p-4">
          <Text className="text-center font-semibold text-white">
            Checkout ({totalItems} items) · ${totalPrice.toFixed(2)}
          </Text>
        </Pressable>
      )}
    </Screen>
  );
}
