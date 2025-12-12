import type {
  UIMessage,
  StreamContextType,
} from "@/core/providers/stream/ag-ui-types";

interface CustomComponentProps {
  message: UIMessage;
  thread: StreamContextType;
}

/**
 * Custom component rendering placeholder.
 * LangGraph UI components are not supported in AG-UI mode.
 * This component is kept for API compatibility but renders nothing.
 */
export const CustomComponent: React.FC<CustomComponentProps> = () => {
  // Custom UI components from LangGraph are not supported in AG-UI mode
  return null;
};
