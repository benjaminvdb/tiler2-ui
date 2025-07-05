export interface UseThreadHandlersProps {
  input: string;
  setInput: (value: string) => void;
  contentBlocks: any[];
  setContentBlocks: (blocks: any[]) => void;
  isRespondingToInterrupt: boolean;
  setIsRespondingToInterrupt: (value: boolean) => void;
  currentInterrupt: any;
  setCurrentInterrupt: (value: any) => void;
  setFirstTokenReceived: (value: boolean) => void;
  artifactContext: any;
  prevMessageLength: React.MutableRefObject<number>;
}

export interface InterruptResponse {
  type: "response";
  args: string;
}
