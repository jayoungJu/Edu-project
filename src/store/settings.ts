import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AIProvider, APISettings } from "@/types";

interface SettingsState extends APISettings {
  setActiveProvider: (provider: AIProvider) => void;
  setApiKey: (provider: AIProvider | "runway", key: string) => void;
  getActiveApiKey: () => string;
  resetSettings: () => void;
}

const defaultSettings: APISettings = {
  activeProvider: "hyperclova",
  hyperclovaApiKey: "",
  openaiApiKey: "",
  geminiApiKey: "",
  claudeApiKey: "",
  runwayApiKey: "",
};

const keyFieldMap: Record<AIProvider | "runway", keyof APISettings> = {
  hyperclova: "hyperclovaApiKey",
  openai: "openaiApiKey",
  gemini: "geminiApiKey",
  claude: "claudeApiKey",
  runway: "runwayApiKey",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setActiveProvider: (provider) => set({ activeProvider: provider }),

      setApiKey: (provider, key) => {
        const state = get();
        const isKeyCleared = key.trim() === "";

        if (isKeyCleared && provider !== "hyperclova" && provider !== "runway" && state.activeProvider === provider) {
          set({ [keyFieldMap[provider]]: "", activeProvider: "hyperclova" });
        } else {
          set({ [keyFieldMap[provider]]: key });
        }
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
    { name: "ai-platform-settings" }
  )
);
