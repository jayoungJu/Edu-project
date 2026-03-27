import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Message, ChatSession, AIProvider } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;

  createSession: (provider: AIProvider, title?: string) => string;
  deleteSession: (id: string) => void;
  setActiveSession: (id: string) => void;
  addMessage: (sessionId: string, message: Omit<Message, "id" | "createdAt">) => void;
  updateSessionTitle: (id: string, title: string) => void;
  clearSessions: () => void;
  getActiveSession: () => ChatSession | null;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,

      createSession: (provider, title) => {
        const id = uuidv4();
        const session: ChatSession = {
          id,
          title: title || "새 대화",
          messages: [],
          provider,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          sessions: [session, ...state.sessions],
          activeSessionId: id,
        }));
        return id;
      },

      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          activeSessionId:
            state.activeSessionId === id ? null : state.activeSessionId,
        })),

      setActiveSession: (id) => set({ activeSessionId: id }),

      addMessage: (sessionId, messageData) => {
        const message: Message = {
          ...messageData,
          id: uuidv4(),
          createdAt: new Date(),
        };
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [...s.messages, message],
                  updatedAt: new Date(),
                  title:
                    s.messages.length === 0 && messageData.role === "user"
                      ? messageData.content.slice(0, 30) + (messageData.content.length > 30 ? "..." : "")
                      : s.title,
                }
              : s
          ),
        }));
      },

      updateSessionTitle: (id, title) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, title } : s
          ),
        })),

      clearSessions: () => set({ sessions: [], activeSessionId: null }),

      getActiveSession: () => {
        const state = get();
        return state.sessions.find((s) => s.id === state.activeSessionId) || null;
      },
    }),
    {
      name: "ai-platform-chat",
    }
  )
);
