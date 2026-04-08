import { ReactNode, useEffect, useState } from 'react';
import { Alert, Switch, TextInput, View } from 'react-native';
import {
  createProduct,
  deleteProduct,
  fetchInventoryEvents,
  fetchProducts,
  InventoryEvent,
  Product,
  updateProduct,
  updateProductInventory,
} from '../../api/products';
import { AppButton } from '../AppButton';
import { AppText } from '../AppText';
import { EmptyState } from '../EmptyState';
import { LoadingState } from '../LoadingState';
import { Screen } from '../Screen';

type EditableValues = {
  name: string;
  price: string;
  stockQuantity: string;
  isAvailable: boolean;
  active: boolean;
};

type ProductManagerScreenProps = {
  marketId?: string | null;
  vendorId?: string | null;
  title: string;
  subtitle: string;
  missingContextMessage: string;
  headerActions?: ReactNode;
};

function formatInventoryCause(event: InventoryEvent) {
  switch (event.cause) {
    case 'product_created':
      return 'Product created';
    case 'manual_edit':
      return 'Manual inventory edit';
    case 'manual_availability':
      return 'Manual availability change';
    case 'order_created':
      return event.reference_order_id
        ? `Reserved for order ${event.reference_order_id.slice(0, 8)}`
        : 'Reserved for order';
    case 'order_canceled':
      return event.reference_order_id
        ? `Restored from canceled order ${event.reference_order_id.slice(0, 8)}`
        : 'Restored from canceled order';
    default:
      return event.event_type.replaceAll('_', ' ');
  }
}

function parseNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function ProductManagerScreen({
  marketId,
  vendorId,
  title,
  subtitle,
  missingContextMessage,
  headerActions,
}: ProductManagerScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStockQuantity, setNewStockQuantity] = useState('0');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<EditableValues | null>(null);
  const [expandedHistoryProductId, setExpandedHistoryProductId] = useState<string | null>(null);
  const [historyByProductId, setHistoryByProductId] = useState<Record<string, InventoryEvent[]>>(
    {}
  );
  const [historyLoadingProductId, setHistoryLoadingProductId] = useState<string | null>(null);

  useEffect(() => {
    if (!marketId || !vendorId) {
      setProducts([]);
      setLoading(false);
      setError(missingContextMessage);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts(marketId, vendorId, { search });
        if (active) {
          setProducts(data);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message ?? 'Failed to load products.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [marketId, vendorId, search, missingContextMessage]);

  async function refreshProducts() {
    if (!marketId || !vendorId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts(marketId, vendorId, { search });
      setProducts(data);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProduct() {
    if (!marketId || !vendorId) return;

    const price = parseNumber(newPrice);
    const stockQuantity = parseNumber(newStockQuantity);

    if (!newName.trim() || price === null || stockQuantity === null) {
      setError('Enter a valid product name, price, and stock quantity.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const created = await createProduct(marketId, vendorId, {
        name: newName.trim(),
        price,
        stock_quantity: Math.max(0, Math.floor(stockQuantity)),
        is_available: stockQuantity > 0,
        active: true,
      });
      setProducts((current) => [...current, created]);
      setNewName('');
      setNewPrice('');
      setNewStockQuantity('0');
    } catch (err: any) {
      setError(err.message ?? 'Failed to create product.');
    } finally {
      setSaving(false);
    }
  }

  function startEditing(product: Product) {
    setEditingProductId(product.id);
    setEditingValues({
      name: product.name,
      price: String(product.price),
      stockQuantity: String(product.stock_quantity),
      isAvailable: product.is_available,
      active: product.active,
    });
  }

  async function handleSaveProduct(productId: string) {
    if (!marketId || !vendorId || !editingValues) return;

    const price = parseNumber(editingValues.price);
    const stockQuantity = parseNumber(editingValues.stockQuantity);

    if (!editingValues.name.trim() || price === null || stockQuantity === null) {
      setError('Enter a valid product name, price, and stock quantity.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updatedProduct = await updateProduct(marketId, vendorId, productId, {
        name: editingValues.name.trim(),
        price,
        active: editingValues.active,
      });

      const inventoryUpdatedProduct = await updateProductInventory(marketId, vendorId, productId, {
        stock_quantity: Math.max(0, Math.floor(stockQuantity)),
        is_available: editingValues.isAvailable,
      });

      setProducts((current) =>
        current.map((product) =>
          product.id === productId
            ? {
                ...product,
                ...updatedProduct,
                stock_quantity: inventoryUpdatedProduct.stock_quantity,
                is_available: inventoryUpdatedProduct.is_available,
              }
            : product
        )
      );

      setEditingProductId(null);
      setEditingValues(null);
    } catch (err: any) {
      setError(err.message ?? 'Failed to update product.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDeleteProduct(product: Product) {
    Alert.alert('Delete product', `Delete ${product.name}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void handleDeleteProduct(product.id);
        },
      },
    ]);
  }

  async function handleDeleteProduct(productId: string) {
    if (!marketId || !vendorId) return;

    try {
      setSaving(true);
      setError(null);
      await deleteProduct(marketId, vendorId, productId);
      setProducts((current) => current.filter((product) => product.id !== productId));
      if (editingProductId === productId) {
        setEditingProductId(null);
        setEditingValues(null);
      }
    } catch (err: any) {
      setError(err.message ?? 'Failed to delete product.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleHistory(productId: string) {
    if (expandedHistoryProductId === productId) {
      setExpandedHistoryProductId(null);
      return;
    }

    setExpandedHistoryProductId(productId);

    if (!marketId || !vendorId || historyByProductId[productId]) {
      return;
    }

    try {
      setHistoryLoadingProductId(productId);
      const events = await fetchInventoryEvents(marketId, vendorId, productId);
      setHistoryByProductId((current) => ({
        ...current,
        [productId]: events,
      }));
    } catch (err: any) {
      setError(err.message ?? 'Failed to load inventory history.');
    } finally {
      setHistoryLoadingProductId(null);
    }
  }

  if (loading && products.length === 0 && marketId && vendorId) {
    return <LoadingState />;
  }

  return (
    <Screen scroll className="pt-6">
      <View className="gap-6 pb-10">
        <View className="gap-2">
          <AppText variant="headline">{title}</AppText>
          <AppText variant="caption">{subtitle}</AppText>
        </View>

        {headerActions ? <View>{headerActions}</View> : null}

        {error && !marketId ? <EmptyState title="Unavailable" description={error} /> : null}

        {marketId && vendorId ? (
          <>
            <View className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <AppText variant="subheading" className="mb-3">
                Filter Products
              </AppText>
              <View className="rounded-xl border border-gray-300 px-4 py-2 dark:border-gray-700">
                <TextInput
                  placeholder="Search products..."
                  value={search}
                  onChangeText={setSearch}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View className="rounded-2xl border border-dashed border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <AppText variant="subheading" className="mb-3">
                Add Product
              </AppText>
              <View className="gap-3">
                <View className="rounded-xl border border-gray-300 px-4 py-2 dark:border-gray-700">
                  <TextInput placeholder="Product name" value={newName} onChangeText={setNewName} />
                </View>
                <View className="rounded-xl border border-gray-300 px-4 py-2 dark:border-gray-700">
                  <TextInput
                    placeholder="Price"
                    value={newPrice}
                    onChangeText={setNewPrice}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View className="rounded-xl border border-gray-300 px-4 py-2 dark:border-gray-700">
                  <TextInput
                    placeholder="Stock quantity"
                    value={newStockQuantity}
                    onChangeText={setNewStockQuantity}
                    keyboardType="number-pad"
                  />
                </View>
                <AppButton
                  onPress={handleCreateProduct}
                  loading={saving}
                  disabled={!newName.trim() || !newPrice.trim()}>
                  Create Product
                </AppButton>
              </View>
            </View>

            {error ? (
              <View className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
                <AppText variant="caption" className="text-red-700 dark:text-red-300">
                  {error}
                </AppText>
              </View>
            ) : null}

            {products.length === 0 ? (
              <EmptyState
                title="No products found"
                description={
                  search.trim()
                    ? 'Try a different search term or create a new product.'
                    : 'This vendor does not have any products yet.'
                }
              />
            ) : (
              products.map((product) => {
                const isEditing = editingProductId === product.id;

                return (
                  <View
                    key={product.id}
                    className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                    {isEditing && editingValues ? (
                      <View className="gap-3">
                        <View className="rounded-xl border border-gray-300 px-4 py-2 dark:border-gray-700">
                          <TextInput
                            value={editingValues.name}
                            onChangeText={(value) =>
                              setEditingValues((current) =>
                                current ? { ...current, name: value } : current
                              )
                            }
                          />
                        </View>
                        <View className="rounded-xl border border-gray-300 px-4 py-2 dark:border-gray-700">
                          <TextInput
                            value={editingValues.price}
                            onChangeText={(value) =>
                              setEditingValues((current) =>
                                current ? { ...current, price: value } : current
                              )
                            }
                            keyboardType="decimal-pad"
                          />
                        </View>
                        <View className="rounded-xl border border-gray-300 px-4 py-2 dark:border-gray-700">
                          <TextInput
                            value={editingValues.stockQuantity}
                            onChangeText={(value) =>
                              setEditingValues((current) =>
                                current ? { ...current, stockQuantity: value } : current
                              )
                            }
                            keyboardType="number-pad"
                          />
                        </View>
                        <View className="flex-row items-center justify-between">
                          <AppText variant="caption">Available</AppText>
                          <Switch
                            value={editingValues.isAvailable}
                            onValueChange={(value) =>
                              setEditingValues((current) =>
                                current ? { ...current, isAvailable: value } : current
                              )
                            }
                          />
                        </View>
                        <View className="flex-row items-center justify-between">
                          <AppText variant="caption">Active</AppText>
                          <Switch
                            value={editingValues.active}
                            onValueChange={(value) =>
                              setEditingValues((current) =>
                                current ? { ...current, active: value } : current
                              )
                            }
                          />
                        </View>
                        <View className="flex-row gap-3">
                          <AppButton
                            className="flex-1"
                            onPress={() => handleSaveProduct(product.id)}
                            loading={saving}>
                            Save
                          </AppButton>
                          <AppButton
                            className="flex-1"
                            variant="ghost"
                            onPress={() => {
                              setEditingProductId(null);
                              setEditingValues(null);
                            }}>
                            Cancel
                          </AppButton>
                        </View>
                      </View>
                    ) : (
                      <View className="gap-3">
                        <View className="flex-row items-start justify-between gap-4">
                          <View className="flex-1">
                            <AppText variant="subheading">{product.name}</AppText>
                            <AppText variant="caption" className="mt-1">
                              ${product.price.toFixed(2)} · Stock {product.stock_quantity}
                            </AppText>
                          </View>
                          <View className="items-end gap-1">
                            <View className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">
                              <AppText variant="caption">
                                {product.is_available ? 'Available' : 'Unavailable'}
                              </AppText>
                            </View>
                            <View className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">
                              <AppText variant="caption">
                                {product.active ? 'Active' : 'Inactive'}
                              </AppText>
                            </View>
                          </View>
                        </View>

                        <View className="flex-row gap-3">
                          <AppButton
                            className="flex-1"
                            variant="secondary"
                            onPress={() => startEditing(product)}>
                            Edit
                          </AppButton>
                          <AppButton
                            className="flex-1"
                            variant="ghost"
                            onPress={() => void toggleHistory(product.id)}>
                            {expandedHistoryProductId === product.id ? 'Hide History' : 'History'}
                          </AppButton>
                        </View>
                        <View className="flex-row gap-3">
                          <AppButton
                            className="flex-1"
                            variant="danger"
                            onPress={() => confirmDeleteProduct(product)}
                            loading={saving}>
                            Delete
                          </AppButton>
                        </View>

                        {expandedHistoryProductId === product.id ? (
                          <View className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950">
                            <AppText variant="caption" className="mb-2">
                              Recent inventory history
                            </AppText>
                            {historyLoadingProductId === product.id ? (
                              <AppText variant="caption">Loading history…</AppText>
                            ) : (historyByProductId[product.id] ?? []).length === 0 ? (
                              <AppText variant="caption">No inventory history yet.</AppText>
                            ) : (
                              (historyByProductId[product.id] ?? []).map((event) => (
                                <View
                                  key={event.id}
                                  className="mb-2 rounded-lg border border-gray-200 p-2 dark:border-gray-800">
                                  <AppText variant="caption">
                                    {formatInventoryCause(event)} ·{' '}
                                    {new Date(event.created_at).toLocaleString()}
                                  </AppText>
                                  <AppText variant="caption">
                                    Stock {event.stock_quantity_before ?? '?'} {'->'}{' '}
                                    {event.stock_quantity_after ?? '?'}
                                    {typeof event.change_amount === 'number'
                                      ? ` (${event.change_amount > 0 ? '+' : ''}${event.change_amount})`
                                      : ''}
                                  </AppText>
                                </View>
                              ))
                            )}
                          </View>
                        ) : null}
                      </View>
                    )}
                  </View>
                );
              })
            )}

            <AppButton variant="ghost" onPress={() => void refreshProducts()}>
              Refresh Products
            </AppButton>
          </>
        ) : null}
      </View>
    </Screen>
  );
}
