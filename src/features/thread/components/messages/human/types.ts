import type {
  UIMessage,
  ContentBlock,
} from "@/core/providers/stream/ag-ui-types";

export interface HumanMessageProps {
  message: UIMessage;
  isLoading: boolean;
}

export interface EditableContentProps {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
}

export interface MultimodalContentProps {
  content: string | ContentBlock[];
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
}
