/**
 * Chat feature types
 */

import type { Message } from "@langchain/langgraph-sdk";

export interface ChatState {
  input: string;
  isLoading: boolean;
  messages: Message[];
  error: string | null;
}

export interface ChatMessage {
  id: string;
  content: string | any[];
  type: "human" | "ai" | "tool";
  timestamp?: number;
}

export interface ChatContextType {
  chatStarted: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  startNewChat: () => void;
}

export interface UIContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}
