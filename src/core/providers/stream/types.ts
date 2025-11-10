import { type Message } from "@langchain/langgraph-sdk";
import {
  type UIMessage,
  type RemoveUIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { useStream } from "@langchain/langgraph-sdk/react";
import { Source } from "@/features/thread/components/markdown/components/citation-link";

export type StepInfo = {
  step_id: string;
  step_type: "tool_call" | "model_response";
  action: string;
  tool_name: string | null;
  status: "running" | "completed" | "error";
  started_at: string;
  completed_at: string | null;
  error: string | null;
};

export type GraphState = {
  messages: Message[];
  ui?: UIMessage[];
  sources?: Source[];
  steps?: StepInfo[];
};

export type StepEvent = {
  event: "step_start" | "step_complete";
  step: StepInfo;
};

export const useTypedStream = useStream<
  GraphState,
  {
    UpdateType: {
      messages?: Message[] | Message | string;
      ui?: (UIMessage | RemoveUIMessage)[] | UIMessage | RemoveUIMessage;
      context?: Record<string, unknown>;
      steps?: StepInfo[];
    };
    CustomEventType: UIMessage | RemoveUIMessage | StepEvent;
    ConfigurableType: {
      workflow_id?: string;
      workflow_type?: string;
    };
  }
>;

export type StreamContextType = ReturnType<typeof useTypedStream> & {
  currentRunId: string | null;
  threadId: string | null;
};

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
