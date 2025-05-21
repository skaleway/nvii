import { create } from "zustand";

interface Breadcrumb {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface BreadcrumbStore {
  breadcrumb: Breadcrumb[];
  setBreadcrumb: (breadcrumb: Breadcrumb[]) => void;
  clearBreadcrumb: () => void;
}

export const useBreadcrumbStore = create<BreadcrumbStore>((set) => ({
  breadcrumb: [],
  setBreadcrumb: (breadcrumb) =>
    set((state) => ({ breadcrumb: [...state.breadcrumb, ...breadcrumb] })),
  clearBreadcrumb: () => set({ breadcrumb: [] }),
}));
