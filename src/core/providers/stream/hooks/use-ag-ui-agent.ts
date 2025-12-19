/**
 * AG-UI Agent Hook - Streaming interface for AG-UI protocol
 */

import { useRef, useEffect, useReducer } from "react";
import { HttpAgent } from "@ag-ui/client";
import type {
  UIMessage,
  GraphState,
  SubmitData,
  SubmitConfig,
  StreamContextType,
} from "../ag-ui-types";
import { executeSubmit } from "./ag-ui-submit";

interface BackendMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

function roleToType(role: string): "human" | "ai" | "tool" {
  if (role === "user") return "human";
  if (role === "assistant") return "ai";
  if (role === "tool") return "tool";
  return "ai";
}

function convertBackendMessages(messages: BackendMessage[]): UIMessage[] {
  return messages.map((msg) => ({
    id: msg.id,
    type: roleToType(msg.role),
    content: msg.content,
  }));
}

interface AgentState {
  messages: UIMessage[];
  isLoading: boolean;
  error: Error | null;
  currentRunId: string | null;
}

type AgentAction =
  | { type: "RESET" }
  | { type: "SET_MESSAGES"; messages: UIMessage[] }
  | { type: "UPDATE_MESSAGES"; updater: (prev: UIMessage[]) => UIMessage[] }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "SET_ERROR"; error: Error | null }
  | { type: "SET_RUN_ID"; runId: string | null }
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; messages: UIMessage[] }
  | { type: "LOAD_ERROR"; error: Error };

function agentReducer(state: AgentState, action: AgentAction): AgentState {
  switch (action.type) {
    case "RESET":
      return {
        messages: [],
        isLoading: false,
        error: null,
        currentRunId: null,
      };
    case "SET_MESSAGES":
      return { ...state, messages: action.messages };
    case "UPDATE_MESSAGES":
      return { ...state, messages: action.updater(state.messages) };
    case "SET_LOADING":
      return { ...state, isLoading: action.isLoading };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SET_RUN_ID":
      return { ...state, currentRunId: action.runId };
    case "LOAD_START":
      return { ...state, isLoading: true };
    case "LOAD_SUCCESS":
      return { ...state, messages: action.messages, isLoading: false };
    case "LOAD_ERROR":
      return { ...state, error: action.error, isLoading: false };
    default:
      return state;
  }
}

const initialState: AgentState = {
  messages: [],
  isLoading: false,
  error: null,
  currentRunId: null,
};

interface UseAGUIAgentConfig {
  apiUrl: string;
  assistantId: string;
  threadId: string | null;
  accessToken: string | null;
  onThreadId?: (id: string) => void;
}

async function fetchThreadMessages(
  apiUrl: string,
  threadId: string,
  accessToken: string,
  dispatch: React.Dispatch<AgentAction>,
) {
  dispatch({ type: "LOAD_START" });
  try {
    const response = await fetch(`${apiUrl}/agent/threads/${threadId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const msg =
        response.status === 404
          ? "Thread not found"
          : `Failed to load thread: ${response.status}`;
      dispatch({ type: "LOAD_ERROR", error: new Error(msg) });
      return;
    }
    const data = await response.json();
    dispatch({
      type: "LOAD_SUCCESS",
      messages: convertBackendMessages(data.messages || []),
    });
  } catch (err) {
    dispatch({
      type: "LOAD_ERROR",
      error: err instanceof Error ? err : new Error("Failed to load thread"),
    });
  }
}

export function useAGUIAgent(cfg: UseAGUIAgentConfig): StreamContextType {
  const { apiUrl, assistantId, threadId, accessToken, onThreadId } = cfg;
  const [state, dispatch] = useReducer(agentReducer, initialState);
  const { messages, isLoading, error, currentRunId } = state;

  const agentRef = useRef<HttpAgent | null>(null);
  const currentMessageIdRef = useRef<string | null>(null);
  const textBufferRef = useRef<string>("");
  const toolCallArgsRef = useRef<Map<string, string>>(new Map());
  const prevThreadIdRef = useRef<string | null>(threadId);
  const fetchAttemptedForRef = useRef<string | null>(null);

  const setMessages = (
    msgs: UIMessage[] | ((prev: UIMessage[]) => UIMessage[]),
  ) => {
    if (typeof msgs === "function") {
      dispatch({ type: "UPDATE_MESSAGES", updater: msgs });
    } else {
      dispatch({ type: "SET_MESSAGES", messages: msgs });
    }
  };

  const setIsLoading = (v: boolean | ((p: boolean) => boolean)) => {
    dispatch({
      type: "SET_LOADING",
      isLoading: typeof v === "function" ? v(state.isLoading) : v,
    });
  };

  const setError = (v: Error | null | ((p: Error | null) => Error | null)) => {
    dispatch({
      type: "SET_ERROR",
      error: typeof v === "function" ? v(state.error) : v,
    });
  };

  const setCurrentRunId = (
    v: string | null | ((p: string | null) => string | null),
  ) => {
    dispatch({
      type: "SET_RUN_ID",
      runId: typeof v === "function" ? v(state.currentRunId) : v,
    });
  };

  const clearError = () => dispatch({ type: "SET_ERROR", error: null });
  const retryStream = async () => dispatch({ type: "SET_ERROR", error: null });
  const stop = () => {
    agentRef.current?.abortRun();
    dispatch({ type: "SET_LOADING", isLoading: false });
  };

  const submit = (data: SubmitData | null, config?: SubmitConfig) => {
    executeSubmit(
      { apiUrl, threadId, assistantId, accessToken, messages, onThreadId },
      { agentRef, currentMessageIdRef, textBufferRef, toolCallArgsRef },
      { setMessages, setIsLoading, setError, setCurrentRunId },
      data,
      config,
    );
  };

  useEffect(() => {
    const prevThreadId = prevThreadIdRef.current;
    prevThreadIdRef.current = threadId;
    const shouldReset =
      (prevThreadId !== null && threadId === null) ||
      (prevThreadId !== null && threadId !== null && prevThreadId !== threadId);
    if (shouldReset) {
      agentRef.current?.abortRun();
      dispatch({ type: "RESET" });
      currentMessageIdRef.current = null;
      textBufferRef.current = "";
      toolCallArgsRef.current.clear();
      fetchAttemptedForRef.current = null;
    }
  }, [threadId]);

  useEffect(() => {
    if (!threadId || !accessToken || isLoading || messages.length > 0) return;
    if (fetchAttemptedForRef.current === threadId) return;
    fetchAttemptedForRef.current = threadId;
    fetchThreadMessages(apiUrl, threadId, accessToken, dispatch);
  }, [threadId, accessToken, apiUrl, isLoading, messages.length]);

  useEffect(() => {
    const agent = agentRef.current;
    return () => {
      agent?.abortRun();
    };
  }, []);

  return {
    messages,
    isLoading,
    error,
    threadId,
    currentRunId,
    values: { messages, sources: [] } as GraphState,
    submit,
    stop,
    clearError,
    retryStream,
    setMessages,
  };
}
