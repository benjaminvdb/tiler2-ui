import { Fragment } from "react/jsx-runtime";
import { LoadExternalComponent } from "@langchain/langgraph-sdk/react-ui";
import { Message } from "@langchain/langgraph-sdk";
import { useStreamContext } from "@/providers/stream";
import { useArtifact } from "../../artifact";

interface CustomComponentProps {
  message: Message;
  thread: ReturnType<typeof useStreamContext>;
}

export function CustomComponent({ message, thread }: CustomComponentProps) {
  const artifact = useArtifact();
  const { values } = useStreamContext();
  const customComponents = values.ui?.filter(
    (ui) => ui.metadata?.message_id === message.id,
  );

  if (!customComponents?.length) return null;

  return (
    <Fragment key={message.id}>
      {customComponents.map((customComponent) => (
        <LoadExternalComponent
          key={customComponent.id}
          stream={thread}
          message={customComponent}
          meta={{ ui: customComponent, artifact }}
        />
      ))}
    </Fragment>
  );
}
