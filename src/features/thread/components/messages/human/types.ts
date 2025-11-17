import { Message } from "@langchain/langgraph-sdk";
import type { JsonValue } from "@/shared/types";

export interface HumanMessageProps {
  message: Message;
  isLoading: boolean;
}

export interface EditableContentProps {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
}

export interface MultimodalContentProps {
  content: JsonValue;
}

export interface TextContentProps {
  contentString: string;
}

export interface MessageControlsProps {
  isLoading: boolean;
  contentString: string;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmitEdit: () => void;
  branch?: string;
  branchOptions?: string[];
  onBranchSelect: (branch: string) => void;
}
