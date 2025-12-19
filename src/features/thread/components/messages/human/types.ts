import type { UIMessage } from "@/core/providers/stream/stream-types";

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
  parts: UIMessage["parts"];
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
