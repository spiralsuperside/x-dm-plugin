import { create } from "zustand";
import { sendCommand } from "../../lib/messaging/bus";
import type { Campaign, Contact, MessageTemplate, Run } from "../../types/entities";

interface CampaignState {
  campaigns: Campaign[];
  selectedCampaignId: string | null;
  contacts: Contact[];
  runs: Run[];
  template: MessageTemplate | null;
  preview: string;
  loading: boolean;
  csvInput: string;
  templateInput: string;
  campaignNameInput: string;
  setCsvInput: (value: string) => void;
  setTemplateInput: (value: string) => void;
  setCampaignNameInput: (value: string) => void;
  loadCampaigns: () => Promise<void>;
  createCampaign: (platform: "x" | "reddit") => Promise<void>;
  selectCampaign: (campaignId: string) => Promise<void>;
  importCsv: (platform: "x" | "reddit") => Promise<void>;
  captureTargets: (platform: "x" | "reddit") => Promise<void>;
  captureReplies: (platform: "x" | "reddit") => Promise<void>;
  saveTemplate: () => Promise<void>;
  renderPreview: (name: string) => Promise<void>;
  createRun: () => Promise<void>;
  startRun: (runId: string) => Promise<void>;
  pauseRun: (runId: string) => Promise<void>;
  cancelRun: (runId: string) => Promise<void>;
  retryRun: (runId: string) => Promise<void>;
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  selectedCampaignId: null,
  contacts: [],
  runs: [],
  template: null,
  preview: "",
  loading: false,
  csvInput: "",
  templateInput: "{Hey | Hi | Hello} {name}, quick question for you.",
  campaignNameInput: "",
  setCsvInput: (value) => set({ csvInput: value }),
  setTemplateInput: (value) => set({ templateInput: value }),
  setCampaignNameInput: (value) => set({ campaignNameInput: value }),

  loadCampaigns: async () => {
    set({ loading: true });
    const { campaigns } = await sendCommand("campaign.list", {});
    set({ campaigns, loading: false });
  },

  createCampaign: async (platform) => {
    const name = get().campaignNameInput.trim() || `${platform.toUpperCase()} Campaign`;
    const { campaign } = await sendCommand("campaign.create", {
      name,
      platform
    });
    set((state) => ({
      campaigns: [campaign, ...state.campaigns],
      selectedCampaignId: campaign.id,
      campaignNameInput: ""
    }));
    await get().selectCampaign(campaign.id);
  },

  selectCampaign: async (campaignId) => {
    const { contacts } = await sendCommand("targets.list", { campaignId });
    const { runs } = await sendCommand("run.list", { campaignId });
    const { template } = await sendCommand("template.get", { campaignId });
    set({
      selectedCampaignId: campaignId,
      contacts,
      runs,
      template,
      templateInput: template?.body ?? get().templateInput
    });
  },

  importCsv: async (platform) => {
    const campaignId = get().selectedCampaignId;
    if (!campaignId) {
      return;
    }
    await sendCommand("targets.import.csv", {
      campaignId,
      platform,
      csvText: get().csvInput
    });
    await get().selectCampaign(campaignId);
  },

  captureTargets: async (platform) => {
    const campaignId = get().selectedCampaignId;
    if (!campaignId) {
      return;
    }
    await sendCommand("target.capture.start", {
      campaignId,
      platform
    });
    await get().selectCampaign(campaignId);
  },

  captureReplies: async (platform) => {
    const campaignId = get().selectedCampaignId;
    if (!campaignId) {
      return;
    }
    await sendCommand("replies.capture.start", {
      campaignId,
      platform
    });
    await get().selectCampaign(campaignId);
  },

  saveTemplate: async () => {
    const campaignId = get().selectedCampaignId;
    if (!campaignId) {
      return;
    }
    const { template } = await sendCommand("template.upsert", {
      campaignId,
      name: "Primary Template",
      body: get().templateInput,
      disallowLinksFirstMessage: true
    });
    set({ template });
  },

  renderPreview: async (name) => {
    const { rendered } = await sendCommand("template.preview.render", {
      templateBody: get().templateInput,
      name,
      seed: 7
    });
    set({ preview: rendered });
  },

  createRun: async () => {
    const campaignId = get().selectedCampaignId;
    if (!campaignId) {
      return;
    }
    await sendCommand("run.create", { campaignId });
    await get().selectCampaign(campaignId);
  },

  startRun: async (runId) => {
    await sendCommand("run.start", { runId });
    const campaignId = get().selectedCampaignId;
    if (campaignId) {
      await get().selectCampaign(campaignId);
    }
  },

  pauseRun: async (runId) => {
    await sendCommand("run.pause", { runId });
    const campaignId = get().selectedCampaignId;
    if (campaignId) {
      await get().selectCampaign(campaignId);
    }
  },

  cancelRun: async (runId) => {
    await sendCommand("run.cancel", { runId });
    const campaignId = get().selectedCampaignId;
    if (campaignId) {
      await get().selectCampaign(campaignId);
    }
  },

  retryRun: async (runId) => {
    await sendCommand("run.retry", { runId });
    const campaignId = get().selectedCampaignId;
    if (campaignId) {
      await get().selectCampaign(campaignId);
    }
  }
}));
