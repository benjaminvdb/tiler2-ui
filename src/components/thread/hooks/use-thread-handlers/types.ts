import type { ContentBlocks, InterruptItem, ArtifactContext } from "@/types";

export interface UseThreadHandlersProps {
  input: string;
  setInput: (value: string) => void;
  contentBlocks: ContentBlocks;
  setContentBlocks: (blocks: ContentBlocks) => void;
  isRespondingToInterrupt: boolean;
  setIsRespondingToInterrupt: (value: boolean) => void;
  currentInterrupt: InterruptItem | null;
  setCurrentInterrupt: (value: InterruptItem | null) => void;
  setFirstTokenReceived: (value: boolean) => void;
  artifactContext: ArtifactContext | null;
  prevMessageLength: React.MutableRefObject<number>;
}

export interface InterruptResponse {
  type: "response";
  args: string;
}
