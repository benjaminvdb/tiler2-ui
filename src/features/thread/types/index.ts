/**
 * Thread feature types
 */

import type { Message } from "@langchain/langgraph-sdk";

export interface ThreadState {
  threadId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ThreadMetadata {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ThreadConfig {
  apiUrl: string;
  assistantId: string;
  maxMessages?: number;
}

export interface ThreadContextType {
  getThreads: () => Promise<import("@langchain/langgraph-sdk").Thread[]>;
  threads: import("@langchain/langgraph-sdk").Thread[];
  setThreads: React.Dispatch<
    React.SetStateAction<import("@langchain/langgraph-sdk").Thread[]>
  >;
  threadsLoading: boolean;
  setThreadsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
