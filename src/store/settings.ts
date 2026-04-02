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

      setApiKey: (provider, key) => {
        // 키가 삭제된 경우 해당 프로바이더가 활성화되어 있으면 HyperCLOVA X로 복귀
        const state = get();
        const isActivProvider = state.activeProvider === provider;
        const isKeyCleared = key.trim() === "";

        if (isKeyCleared && isActivProvider && provider !== "hyperclova") {
          set({ [keyFieldMap[provider]]: "", activeProvider: "hyperclova" });
        } else {
          set({ [keyFieldMap[provider]]: key });
        }
      },

      getActiveApiKey: () => {
        const state = get();
        switch (state.activeProvider) {
          case "hyperclova":
            // HyperCLOVA X는 사용자 키가 없어도 서버 환경변수로 동작
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
