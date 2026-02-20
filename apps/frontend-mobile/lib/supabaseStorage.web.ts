export const supabaseStorage = {
  getItem: async (key: string) => {
    return typeof window !== "undefined"
      ? window.localStorage.getItem(key)
      : null;
  },
  setItem: async (key: string, value: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
  },
};
