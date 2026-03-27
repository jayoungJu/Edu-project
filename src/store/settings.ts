import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AIProvider, APISettings } from "@/types";

interface SettingsState extends APISettings {
  setActiveProvider: (provider: AIProvider) => void;
  setApiKey: (provider: AIProvider, key: string) => void;
  getActiveApiKey: () => string;
  resetSettings: () => void;
}

const defaultSettings: APISettings = {
  activeProvider: "hyperclova",
  hyperclovaApiKey: "",
  openaiApiKey: "",
  geminiApiKey: "",
  claudeApiKey: "",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setActiveProvider: (provider) => set({ activeProvider: provider }),

      setApiKey: (provider, key) => {
        const keyMap: Record<AIProvider, keyof APISettings> = {
          hyperclova: "hyperclovaApiKey",
          openai: "openaiApiKey",
          gemini: "geminiApiKey",
          claude: "claudeApiKey",
        };
        set({ [keyMap[provider]]: key });
      },

      getActiveApiKey: () => {
        const state = get();
        switch (state.activeProvider) {
          case "hyperclova":
            return state.hyperclovaApiKey;
          case "openai":
            return state.openaiApiKey;
          case "gemini":
            return state.geminiApiKey;
          case "claude":
            return state.claudeApiKey;
          default:
            return "";
        }
      },

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: "ai-platform-settings",
    }
  )
);
