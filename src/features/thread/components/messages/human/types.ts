import type { Message, UserMessage } from "@copilotkit/shared";

/**
 * Props for the HumanMessage component.
 * Uses AG-UI Message format with role: "user".
 */
export interface HumanMessageProps {
  message: Message;
  isLoading: boolean;
}

export interface EditableContentProps {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
}

/**
 * Content for multimodal messages.
 * Uses AG-UI InputContent format: TextInputContent | BinaryInputContent
 */
export interface MultimodalContentProps {
  content: UserMessage["content"]; // string | InputContent[]
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
