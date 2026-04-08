import { useEffect, useState } from 'react';
import { EmptyState, LoadingState } from '../../../components';
import { useAppStore } from '../../../store/useAppStore';
import { fetchVendor, Vendor } from '../../../api/vendors';
import { ProductManagerScreen } from '../../../components/products/ProductManagerScreen';

export default function VendorProductsScreen() {
  const vendorId = useAppStore((s) => s.vendorId);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      setError('Vendor account not configured for this user.');
      return;
    }

    let active = true;
    const currentVendorId = vendorId;

    async function loadVendor() {
      try {
        setLoading(true);
        setError(null);
        const vendorData = await fetchVendor(currentVendorId);
        if (!active) return;

        setVendor(vendorData);
        setLoading(false);
      } catch (err: any) {
        if (active) {
          setError(err.message ?? 'Failed to load vendor details.');
          setLoading(false);
        }
      }
    }

    void loadVendor();

    return () => {
      active = false;
    };
  }, [vendorId]);

  if (loading && !vendor) {
    return <LoadingState />;
  }

  if (!vendor) {
    return (
      <EmptyState
        title="Vendor unavailable"
        description={error ?? 'Vendor account not configured for this user.'}
      />
    );
  }

  return (
    <ProductManagerScreen
      marketId={vendor.market_id}
      vendorId={vendorId}
      title="My Products"
      subtitle={`${vendor.name} · ${vendor.market_id}`}
      missingContextMessage="Vendor account not configured for this user."
    />
  );
}
