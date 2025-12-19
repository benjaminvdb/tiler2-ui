import { useState, useRef } from "react";
import { useSearchParamState } from "@/core/routing/hooks";
import {
  useArtifactContext,
  useArtifactOpen,
} from "@/features/artifacts/components";

interface ThreadStateValue {
  artifactContext: Record<string, unknown>;
  setArtifactContext: (context: Record<string, unknown>) => void;
  artifactOpen: boolean;
  closeArtifact: () => void;
  threadId: string | null;
  hideToolCalls: boolean;
  setHideToolCalls: (hide: boolean) => void;
  input: string;
  setInput: (input: string) => void;
  firstTokenReceived: boolean;
  setFirstTokenReceived: (received: boolean) => void;
  lastErrorRef: React.MutableRefObject<string | undefined>;
  prevMessageLength: React.MutableRefObject<number>;
}

export function useThreadState(): ThreadStateValue {
  const [artifactContext, setArtifactContext] = useArtifactContext();
  const [artifactOpen, closeArtifact] = useArtifactOpen();

  const [threadId, _setThreadId] = useSearchParamState("threadId");
  const [hideToolCalls, setHideToolCalls] =
    useSearchParamState("hideToolCalls");

  const [input, setInput] = useState("");
  const [firstTokenReceived, setFirstTokenReceived] = useState(false);

  const lastErrorRef = useRef<string | undefined>(undefined);
  const prevMessageLength = useRef(0);

  const shouldHideToolCallsByDefault =
    import.meta.env.VITE_HIDE_TOOL_CALLS !== "false";

  return {
    artifactContext,
    setArtifactContext,
    artifactOpen,
    closeArtifact,

    threadId,
    hideToolCalls:
      hideToolCalls !== null
        ? hideToolCalls === true
        : shouldHideToolCallsByDefault,
    setHideToolCalls: (value: boolean) => setHideToolCalls(value ? true : null),

    input,
    setInput,
    firstTokenReceived,
    setFirstTokenReceived,

    lastErrorRef,
    prevMessageLength,
  };
}
