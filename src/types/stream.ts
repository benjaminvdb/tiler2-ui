// Stream and interruption types
export interface InterruptData {
  id: string;
  type: string;
  args?: Record<string, unknown>;
  timestamp: number;
}

export interface Message {
  id: string;
  type: "human" | "ai" | "tool" | "system";
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
  toolCalls?: ToolCall[];
  parentId?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
}

export interface SubmitOptions {
  checkpoint?: string;
  streamMode?: string[];
  metadata?: Record<string, unknown>;
}

export interface StreamData {
  messages?: string | Message | Message[];
  ui?: UIMessage | RemoveUIMessage | (UIMessage | RemoveUIMessage)[];
  context?: Record<string, unknown>;
}

export interface UIMessage {
  id: string;
  type: string;
  content: Record<string, unknown>;
}

export interface RemoveUIMessage {
  type: "remove";
  id: string;
}

export interface StreamContextType {
  messages: Message[];
  submit: (data?: StreamData | null, options?: SubmitOptions) => void;
  isLoading: boolean;
  error?: Error | null;
  interrupt?: InterruptData | null;
}

export interface ToolCallArgs {
  [key: string]: unknown;
}

export interface MessageContent {
  type: string;
  content?: string;
  args?: ToolCallArgs;
}
