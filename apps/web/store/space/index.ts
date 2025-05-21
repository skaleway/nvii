import { create } from "zustand";

type SpaceModalStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

type ConfirmationModalStore = {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  onOpen: ({
    title,
    description,
    onConfirm,
    onCancel,
  }: {
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) => void;
  onClose: () => void;
};

export const useSpaceModal = create<SpaceModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useConfirmationModal = create<ConfirmationModalStore>((set) => ({
  isOpen: false,
  title: "",
  description: "",
  onConfirm: () => {},
  onCancel: () => {},
  isLoading: false,
  onOpen: ({
    title,
    description,
    onConfirm,
    onCancel,
  }: {
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    set({
      isOpen: true,
      isLoading: false,
      title: title,
      description: description,
      onConfirm: onConfirm,
      onCancel: onCancel,
    }),
  onClose: () =>
    set({
      isOpen: false,
      isLoading: false,
      title: "",
      description: "",
      onConfirm: () => {},
      onCancel: () => {},
    }),
}));
