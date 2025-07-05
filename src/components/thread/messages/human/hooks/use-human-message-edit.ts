import { useState } from "react";
import { useStreamContext } from "@/providers/stream";
import { Message } from "@langchain/langgraph-sdk";

export function useHumanMessageEdit(message: Message, contentString: string) {
  const thread = useStreamContext();
  const meta = thread.getMessagesMetadata(message);
  const parentCheckpoint = meta?.firstSeenState?.parent_checkpoint;

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");

  const handleSubmitEdit = () => {
    setIsEditing(false);

    const newMessage: Message = { type: "human", content: value };
    thread.submit(
      { messages: [newMessage] },
      {
        checkpoint: parentCheckpoint,
        streamMode: ["values"],
        optimisticValues: (prev) => {
          const values = meta?.firstSeenState?.values;
          if (!values) return prev;

          return {
            ...values,
            messages: [...(values.messages ?? []), newMessage],
          };
        },
      },
    );
  };

  const handleSetIsEditing = (
    editing: boolean | ((prev: boolean) => boolean),
  ) => {
    const newEditing =
      typeof editing === "function" ? editing(isEditing) : editing;
    if (newEditing) {
      setValue(contentString);
    }
    setIsEditing(newEditing);
  };

  return {
    isEditing,
    value,
    setValue,
    handleSubmitEdit,
    setIsEditing: handleSetIsEditing,
    meta,
  };
}
