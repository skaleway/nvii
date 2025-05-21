import { create } from "zustand";

interface teamStore {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const useTeamStore = create<teamStore>((set) => ({
  isOpen: false,
  onClose: () => set({ isOpen: false }),
  onOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));
