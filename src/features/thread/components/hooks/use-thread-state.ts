import { useState, useRef } from "react";
import { useSearchParamState } from "@/core/routing/hooks";
import {
  useArtifactContext,
  useArtifactOpen,
} from "@/features/artifacts/components";
import type { HumanInterrupt } from "@langchain/langgraph/prebuilt";

export function useThreadState(): {
  // Artifact state
  artifactContext: any;
  setArtifactContext: (context: any) => void;
  artifactOpen: boolean;
  closeArtifact: () => void;
  // Thread state
  threadId: string | null;
  hideToolCalls: boolean;
  setHideToolCalls: (hide: boolean) => void;
  // Input state
  input: string;
  setInput: (input: string) => void;
  firstTokenReceived: boolean;
  setFirstTokenReceived: (received: boolean) => void;
  // Interrupt state
  isRespondingToInterrupt: boolean;
  setIsRespondingToInterrupt: (responding: boolean) => void;
  currentInterrupt: HumanInterrupt | null;
  setCurrentInterrupt: (interrupt: HumanInterrupt | null) => void;
  // Refs
  lastError: React.MutableRefObject<string | undefined>;
  prevMessageLength: React.MutableRefObject<number>;
} {
  const [artifactContext, setArtifactContext] = useArtifactContext();
  const [artifactOpen, closeArtifact] = useArtifactOpen();

  const [threadId, _setThreadId] = useSearchParamState("threadId");
  const [hideToolCalls, setHideToolCalls] =
    useSearchParamState("hideToolCalls");

  const [input, setInput] = useState("");
  const [firstTokenReceived, setFirstTokenReceived] = useState(false);
  const [isRespondingToInterrupt, setIsRespondingToInterrupt] = useState(false);
  const [currentInterrupt, setCurrentInterrupt] =
    useState<HumanInterrupt | null>(null);

  const lastError = useRef<string | undefined>(undefined);
  const prevMessageLength = useRef(0);

  // Fail-safe: Hide tool calls by default unless explicitly set to false
  const envDefaultHide = process.env.NEXT_PUBLIC_HIDE_TOOL_CALLS !== "false";

  return {
    // Artifact state
    artifactContext,
    setArtifactContext,
    artifactOpen,
    closeArtifact,

    // Thread state
    threadId,
    hideToolCalls: hideToolCalls !== null ? (hideToolCalls === true) : envDefaultHide,
    setHideToolCalls: (value: boolean) => setHideToolCalls(value ? true : null),

    // Input state
    input,
    setInput,
    firstTokenReceived,
    setFirstTokenReceived,

    // Interrupt state
    isRespondingToInterrupt,
    setIsRespondingToInterrupt,
    currentInterrupt,
    setCurrentInterrupt,

    // Refs
    lastError,
    prevMessageLength,
  };
}
