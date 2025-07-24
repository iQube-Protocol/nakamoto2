import { create } from 'zustand';

interface GlobalMediaState {
  isMediaVisible: boolean;
  showMedia: () => void;
  hideMedia: () => void;
}

export const useGlobalMedia = create<GlobalMediaState>((set) => ({
  isMediaVisible: false,
  showMedia: () => set({ isMediaVisible: true }),
  hideMedia: () => set({ isMediaVisible: false }),
}));