export type AIProvider = "hyperclova" | "openai" | "gemini" | "claude";

export interface APISettings {
  activeProvider: AIProvider;
  hyperclovaApiKey: string;
  openaiApiKey: string;
  geminiApiKey: string;
  claudeApiKey: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  template: string;
  variables: string[];
  createdAt: Date;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  createdAt: Date;
}

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentType =
  | "business_plan"
  | "proposal"
  | "contract"
  | "marketing"
  | "email"
  | "report"
  | "announcement"
  | "sns_post";

export interface DesignTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  description: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  provider: AIProvider;
  createdAt: Date;
  updatedAt: Date;
}
