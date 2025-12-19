import type {
  UIMessage,
  StreamContextType,
} from "@/core/providers/stream/stream-types";

interface CustomComponentProps {
  message: UIMessage;
  thread: StreamContextType;
}

/**
 * Custom component rendering placeholder.
 * Custom LangGraph UI components are not supported in this UI.
 * This component is kept for API compatibility but renders nothing.
 */
export const CustomComponent: React.FC<CustomComponentProps> = () => {
  // Custom UI components from LangGraph are not supported here.
  return null;
};
