import { useState, useRef } from "react";
import { useQueryState, parseAsBoolean } from "nuqs";
import { useArtifactContext, useArtifactOpen } from "../artifact";

export function useThreadState() {
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
  const [currentInterrupt, setCurrentInterrupt] = useState<any>(null);

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
