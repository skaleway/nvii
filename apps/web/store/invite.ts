import { create } from "zustand";

interface inviteStore {
  isOpen: boolean;
  onToggle: () => void;
}

export const useInviteStore = create<inviteStore>((set) => ({
  isOpen: false,
  onToggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
