import React from "react";
import { AIProvider } from "@/types";
import { cn } from "@/lib/utils";

const providerConfig: Record<AIProvider, { label: string; color: string; bg: string }> = {
  hyperclova: {
    label: "HyperCLOVA X",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
  openai: {
    label: "ChatGPT",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
  },
  gemini: {
    label: "Gemini",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
  },
  claude: {
    label: "Claude",
    color: "text-violet-700",
    bg: "bg-violet-50 border-violet-200",
  },
};

interface ProviderBadgeProps {
  provider: AIProvider;
  className?: string;
}

export function ProviderBadge({ provider, className }: ProviderBadgeProps) {
  const config = providerConfig[provider];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.bg,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}
