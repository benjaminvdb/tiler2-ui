import { useState, useRef } from "react";
import { useQueryState, parseAsBoolean } from "nuqs";
import {
  useArtifactContext,
  useArtifactOpen,
} from "@/features/artifacts/components/artifact";
import type { HumanInterrupt } from "@langchain/langgraph/prebuilt";

export function useThreadState(): {
  // Artifact state
  artifactContext: any;
  setArtifactContext: (context: any) => void;
  artifactOpen: boolean;
  closeArtifact: () => void;
  // Thread state
  threadId: string | null;
  setThreadId: (id: string | null) => void;
  chatHistoryOpen: boolean;
  setChatHistoryOpen: (open: boolean) => void;
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

  const [threadId, _setThreadId] = useQueryState("threadId");
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    parseAsBoolean.withDefault(false),
  );
  const [hideToolCalls, setHideToolCalls] = useQueryState(
    "hideToolCalls",
    parseAsBoolean.withDefault(false),
  );

  const [input, setInput] = useState("");
  const [firstTokenReceived, setFirstTokenReceived] = useState(false);
  const [isRespondingToInterrupt, setIsRespondingToInterrupt] = useState(false);
  const [currentInterrupt, setCurrentInterrupt] =
    useState<HumanInterrupt | null>(null);

  const lastError = useRef<string | undefined>(undefined);
  const prevMessageLength = useRef(0);

  const setThreadId = (id: string | null) => {
    _setThreadId(id);
    // close artifact and reset artifact context
    closeArtifact();
    setArtifactContext({});
  };

  return {
    // Artifact state
    artifactContext,
    setArtifactContext,
    artifactOpen,
    closeArtifact,

    // Thread state
    threadId,
    setThreadId,
    chatHistoryOpen,
    setChatHistoryOpen,
    hideToolCalls,
    setHideToolCalls,

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
