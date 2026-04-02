import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AIProvider, APISettings, VideoProvider } from "@/types";

interface SettingsState extends APISettings {
  setActiveProvider: (provider: AIProvider) => void;
  setVideoProvider: (provider: VideoProvider) => void;
  setApiKey: (provider: AIProvider, key: string) => void;
  getActiveApiKey: () => string;
  resetSettings: () => void;
}

const defaultSettings: APISettings = {
  activeProvider: "hyperclova",
  videoProvider: "openai",
  hyperclovaApiKey: "",
  openaiApiKey: "",
  geminiApiKey: "",
  claudeApiKey: "",
};

const keyFieldMap: Record<AIProvider, keyof APISettings> = {
  hyperclova: "hyperclovaApiKey",
  openai: "openaiApiKey",
  gemini: "geminiApiKey",
  claude: "claudeApiKey",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setActiveProvider: (provider) => set({ activeProvider: provider }),

      setVideoProvider: (provider) => set({ videoProvider: provider }),

      setApiKey: (provider, key) => {
        const state = get();
        const isKeyCleared = key.trim() === "";

        if (isKeyCleared && provider !== "hyperclova" && state.activeProvider === provider) {
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
