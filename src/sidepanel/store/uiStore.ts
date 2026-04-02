import { create } from "zustand";

type TabId = "campaigns" | "contacts" | "runs";

interface UiState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeTab: "campaigns",
  setActiveTab: (tab) => set({ activeTab: tab })
}));
