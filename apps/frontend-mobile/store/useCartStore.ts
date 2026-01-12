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

  locked: boolean;
  lockCart: () => void;
  unlockCart: () => void;

  /* derived state */
  totalItems: number;
  totalPrice: number;

  /* helpers */
  recompute: (items: CartItem[]) => {
    totalItems: number;
    totalPrice: number;
  };

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
  totalItems: 0,
  totalPrice: 0,
  locked: false,

  /* ---------- helpers ---------- */
  recompute: (items: CartItem[]) => ({
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  }),

  /* ---------- Actions ---------- */
  initCart: (marketId, vendorId) => {
    const state = get();

    if (state.marketId !== marketId || state.vendorId !== vendorId) {
      set({
        marketId,
        vendorId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
    }
  },

  addItem: (item) => {
    const items = get().items;
    const existing = items.find((i) => i.product_id === item.product_id);

    const nextItems = existing
      ? items.map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      : [...items, { ...item, quantity: 1 }];

    set({
      items: nextItems,
      ...get().recompute(nextItems),
    });
  },

  removeItem: (productId) => {
    const nextItems = get().items.filter(
      (i) => i.product_id !== productId
    );

    set({
      items: nextItems,
      ...get().recompute(nextItems),
    });
  },
  lockCart: () => set({ locked: true }),
  unlockCart: () => set({ locked: false }),

  clearCart: () =>
    set({
      items: [],
      marketId: null,
      vendorId: null,
      totalItems: 0,
      totalPrice: 0,
    }),
}));
