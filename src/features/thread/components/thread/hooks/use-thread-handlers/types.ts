import type { ContentBlocks, ArtifactContext } from "@/shared/types";
import type { HumanInterrupt } from "@langchain/langgraph/prebuilt";

export interface UseThreadHandlersProps {
  input: string;
  setInput: (value: string) => void;
  contentBlocks: ContentBlocks;
  setContentBlocks: (blocks: ContentBlocks) => void;
  isRespondingToInterrupt: boolean;
  setIsRespondingToInterrupt: (value: boolean) => void;
  currentInterrupt: HumanInterrupt | null;
  setCurrentInterrupt: (value: HumanInterrupt | null) => void;
  setFirstTokenReceived: (value: boolean) => void;
  artifactContext: ArtifactContext | null;
  prevMessageLength: React.MutableRefObject<number>;
}

export interface InterruptResponse {
  type: "response";
  args: string;
}
