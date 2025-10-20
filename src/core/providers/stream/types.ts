import { type Message } from "@langchain/langgraph-sdk";
import {
  type UIMessage,
  type RemoveUIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { useStream } from "@langchain/langgraph-sdk/react";
import { Source } from "@/features/thread/components/markdown/components/citation-link";

export type GraphState = {
  messages: Message[];
  ui?: UIMessage[];
  sources?: Source[];
};

export const useTypedStream = useStream<
  GraphState,
  {
    UpdateType: {
      messages?: Message[] | Message | string;
      ui?: (UIMessage | RemoveUIMessage)[] | UIMessage | RemoveUIMessage;
      context?: Record<string, unknown>;
    };
    CustomEventType: UIMessage | RemoveUIMessage;
    ConfigurableType: {
      workflow_id?: string;
      workflow_type?: string;
    };
  }
>;

export type StreamContextType = ReturnType<typeof useTypedStream>;

export interface StreamSessionProps {
  children: React.ReactNode;
  apiUrl: string;
  assistantId: string;
}

export interface ConfigurationFormProps {
  apiUrl: string;
  assistantId: string;
  onSubmit: (data: { apiUrl: string; assistantId: string }) => void;
}
