import { useStreamContext } from "@/core/providers/stream";
import { useThreads } from "@/features/thread/providers/thread-provider";
import { useAuth0 } from "@auth0/auth0-react";
import { UseThreadHandlersProps } from "./use-thread-handlers/types";
import { createSubmitHandler } from "./use-thread-handlers/handlers/submit-handler";
import { createActionHandler } from "./use-thread-handlers/handlers/action-handler";

export function useThreadHandlers(props: UseThreadHandlersProps): {
  handleSubmit: (e: React.FormEvent) => void;
  handleActionClick: (prompt: string) => void;
} {
  const stream = useStreamContext();
  const isLoading = stream.isLoading;
  const { addOptimisticThread } = useThreads();
  const { user } = useAuth0();

  const handleSubmit = createSubmitHandler(
    props,
    stream,
    isLoading,
    addOptimisticThread,
    user?.email || "",
  );
  const handleActionClick = createActionHandler(stream);

  return {
    handleSubmit,
    handleActionClick,
  };
}
