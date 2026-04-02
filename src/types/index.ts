export type AIProvider = "hyperclova" | "openai" | "gemini" | "claude";

export interface APISettings {
  activeProvider: AIProvider;
  hyperclovaApiKey: string;
  openaiApiKey: string;
  geminiApiKey: string;
  claudeApiKey: string;
  runwayApiKey: string;
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

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  provider: AIProvider;
  createdAt: Date;
  updatedAt: Date;
}

// Video types
export type VideoMode =
  | "text-to-video"
  | "image-to-video"
  | "video-effects"
  | "ai-avatar";

export interface VideoJob {
  id: string;
  mode: VideoMode;
  prompt: string;
  status: "pending" | "processing" | "succeeded" | "failed";
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: Date;
}

export interface VideoEffect {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  prompt: string;
}
