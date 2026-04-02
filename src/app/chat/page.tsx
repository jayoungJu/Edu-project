"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Plus,
  Trash2,
  MessageSquare,
  Bot,
  User,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ProviderBadge } from "@/components/ui/provider-badge";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/useToast";
import { useChatStore } from "@/store/chat";
import { useSettingsStore } from "@/store/settings";
import { cn, formatDate } from "@/lib/utils";
import { Message } from "@/types";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const { toasts, removeToast, success, error } = useToast();

  const { sessions, activeSessionId, createSession, setActiveSession, deleteSession, getActiveSession, addMessage } = useChatStore();
  const { activeProvider, getActiveApiKey } = useSettingsStore();

  const activeSession = getActiveSession();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages]);

  const handleNewSession = () => {
    createSession(activeProvider);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = createSession(activeProvider);
    }

    const userMessage = input.trim();
    setInput("");

    addMessage(sessionId, { role: "user", content: userMessage });
    setIsLoading(true);

    try {
      const currentSession = useChatStore.getState().sessions.find((s) => s.id === sessionId);
      const messages = currentSession?.messages || [];

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          provider: activeProvider,
          apiKey: getActiveApiKey(),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "AI 응답 생성에 실패했습니다.");
      }

      const data = await response.json();
      addMessage(sessionId, { role: "assistant", content: data.content });
    } catch (err) {
      error(err instanceof Error ? err.message : "오류가 발생했습니다.");
      addMessage(sessionId, {
        role: "assistant",
        content: "죄송합니다. 응답 생성 중 오류가 발생했습니다. API 키 설정을 확인해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (message: Message) => {
    await navigator.clipboard.writeText(message.content);
    setCopiedId(message.id);
    success("복사되었습니다");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-gray-50">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Sessions Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <Button onClick={handleNewSession} className="w-full" size="sm">
            <Plus className="h-4 w-4" />
            새 대화 시작
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">대화 내역이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors",
                    session.id === activeSessionId
                      ? "bg-violet-50 text-violet-700"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                  onClick={() => setActiveSession(session.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{session.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="hidden group-hover:block text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {!activeSession ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI와 대화를 시작하세요</h2>
            <p className="text-gray-500 mb-6 max-w-md">
              비즈니스 전략, 마케팅 아이디어, 고객 응대 방법 등<br />
              무엇이든 물어보세요!
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {[
                "마케팅 전략 추천해줘",
                "SNS 게시물 작성 도와줘",
                "고객 응대 방법을 알려줘",
                "사업 아이디어 검토해줘",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 text-sm hover:bg-violet-100 transition-colors border border-violet-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <Button onClick={handleNewSession}>
              <Plus className="h-4 w-4" /> 새 대화 시작
            </Button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeSession.messages.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <p className="text-sm">메시지를 입력하여 대화를 시작하세요</p>
                </div>
              )}
              {activeSession.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 group",
                    message.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      message.role === "user"
                        ? "bg-violet-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed relative",
                      message.role === "user"
                        ? "bg-violet-600 text-white rounded-tr-sm"
                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-sm"
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <button
                      onClick={() => handleCopy(message)}
                      className={cn(
                        "absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1",
                        message.role === "user"
                          ? "right-0 text-gray-400 hover:text-gray-600"
                          : "left-0 text-gray-400 hover:text-gray-600"
                      )}
                    >
                      {copiedId === message.id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      복사
                    </button>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5 items-center">
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-end gap-3 max-w-4xl mx-auto">
                <div className="flex-1">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
                    className="min-h-[52px] max-h-32 resize-none"
                    rows={1}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <ProviderBadge provider={activeProvider} />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    loading={isLoading}
                    size="icon"
                    className="h-[52px] w-12 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
