import { createJSONStorage } from "zustand/middleware";

export const storage = createJSONStorage(() => ({
  getItem: (name: string) =>
    Promise.resolve(localStorage.getItem(name)),
  setItem: (name: string, value: string) =>
    Promise.resolve(localStorage.setItem(name, value)),
  removeItem: (name: string) =>
    Promise.resolve(localStorage.removeItem(name)),
}));
