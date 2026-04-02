import { create } from "zustand";

type TabId = "canvas" | "contacts" | "runs";

interface UiState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeTab: "canvas",
  setActiveTab: (tab) => set({ activeTab: tab })
}));
