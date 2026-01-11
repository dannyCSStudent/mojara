import { create } from "zustand";

export type CartItem = {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
};

interface CartState {
  marketId: string | null;
  vendorId: string | null;
  items: CartItem[];

  /* derived */
  totalItems: () => number;
  totalPrice: () => number;

  /* actions */
  initCart: (marketId: string, vendorId: string) => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  marketId: null,
  vendorId: null,
  items: [],

  /* ---------- Derived ---------- */
  totalItems: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  /* ---------- Actions ---------- */
  initCart: (marketId, vendorId) => {
    const state = get();

    if (state.marketId !== marketId || state.vendorId !== vendorId) {
      set({
        marketId,
        vendorId,
        items: [],
      });
    }
  },

  addItem: (item) => {
    const items = get().items;
    const existing = items.find((i) => i.product_id === item.product_id);

    if (existing) {
      set({
        items: items.map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      });
    } else {
      set({
        items: [...items, { ...item, quantity: 1 }],
      });
    }
  },

  removeItem: (productId) => {
    set({
      items: get().items.filter((i) => i.product_id !== productId),
    });
  },

  clearCart: () =>
    set({
      items: [],
      marketId: null,
      vendorId: null,
    }),
}));
