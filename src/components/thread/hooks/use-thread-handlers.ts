import { useStreamContext } from "@/providers/Stream";
import { UseThreadHandlersProps } from "./use-thread-handlers/types";
import { createSubmitHandler } from "./use-thread-handlers/handlers/submit-handler";
import { createRegenerateHandler } from "./use-thread-handlers/handlers/regenerate-handler";
import { createActionHandler } from "./use-thread-handlers/handlers/action-handler";

export function useThreadHandlers(props: UseThreadHandlersProps) {
  const stream = useStreamContext();
  const isLoading = stream.isLoading;

  const handleSubmit = createSubmitHandler(props, stream, isLoading);
  const handleRegenerate = createRegenerateHandler(
    stream,
    props.setFirstTokenReceived,
    props.prevMessageLength
  );
  const handleActionClick = createActionHandler(stream);

  return {
    handleSubmit,
    handleRegenerate,
    handleActionClick,
  };
}