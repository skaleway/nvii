import { create } from "zustand";

interface LogoutStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useLogoutStore = create<LogoutStore>((set) => ({
  isOpen: false,
  onClose: () => set({ isOpen: false }),
  onOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));
