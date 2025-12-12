import type { ContentBlocks, ArtifactContext } from "@/shared/types";

export interface UseThreadHandlersProps {
  input: string;
  setInput: (value: string) => void;
  contentBlocks: ContentBlocks;
  setContentBlocks: (blocks: ContentBlocks) => void;
  setFirstTokenReceived: (value: boolean) => void;
  artifactContext: ArtifactContext | null;
  prevMessageLength: React.MutableRefObject<number>;
}
