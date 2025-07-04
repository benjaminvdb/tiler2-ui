import { type Message } from "@langchain/langgraph-sdk";
import { type UIMessage, type RemoveUIMessage } from "@langchain/langgraph-sdk/react-ui";
import { useStream } from "@langchain/langgraph-sdk/react";

export type StateType = { messages: Message[]; ui?: UIMessage[] };

export const useTypedStream = useStream<
  StateType,
  {
    UpdateType: {
      messages?: Message[] | Message | string;
      ui?: (UIMessage | RemoveUIMessage)[] | UIMessage | RemoveUIMessage;
      context?: Record<string, unknown>;
    };
    CustomEventType: UIMessage | RemoveUIMessage;
  }
>;

export type StreamContextType = ReturnType<typeof useTypedStream>;

export interface StreamSessionProps {
  children: React.ReactNode;
  apiKey: string | null;
  apiUrl: string;
  assistantId: string;
}

export interface ConfigurationFormProps {
  apiUrl: string;
  assistantId: string;
  apiKey: string | null;
  onSubmit: (data: { apiUrl: string; assistantId: string; apiKey: string }) => void;
}