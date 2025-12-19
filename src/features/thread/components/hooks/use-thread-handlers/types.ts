import type { ContentBlocks } from "@/shared/types";

export interface UseThreadHandlersProps {
  input: string;
  setInput: (value: string) => void;
  contentBlocks: ContentBlocks;
  setContentBlocks: (blocks: ContentBlocks) => void;
  setFirstTokenReceived: (value: boolean) => void;
}
