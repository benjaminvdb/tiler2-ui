import { useState, useRef } from "react";
import { useSearchParamState } from "@/core/routing/hooks";
import { useArtifactOpen } from "@/features/artifacts/components";

interface ThreadStateValue {
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
}

export function useThreadState(): ThreadStateValue {
  const [artifactOpen, closeArtifact] = useArtifactOpen();

  const [threadId, _setThreadId] = useSearchParamState("threadId");
  const [hideToolCalls, setHideToolCalls] =
    useSearchParamState("hideToolCalls");

  const [input, setInput] = useState("");
  const [firstTokenReceived, setFirstTokenReceived] = useState(false);

  const lastErrorRef = useRef<string | undefined>(undefined);

  const shouldHideToolCallsByDefault =
    import.meta.env.VITE_HIDE_TOOL_CALLS !== "false";

  return {
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
  };
}
