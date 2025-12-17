import { useCopilotChat } from "@/core/providers/copilotkit";
import { useThreads } from "@/features/thread/providers/thread-provider";
import { useAuth0 } from "@auth0/auth0-react";
import { UseThreadHandlersProps } from "./use-thread-handlers/types";
import { createSubmitHandler } from "./use-thread-handlers/handlers/submit-handler";
import { createActionHandler } from "./use-thread-handlers/handlers/action-handler";

export function useThreadHandlers(props: UseThreadHandlersProps): {
  handleSubmit: (e: React.FormEvent) => void;
  handleActionClick: (prompt: string) => void;
} {
  const chat = useCopilotChat();
  const isLoading = chat.isLoading;
  const { addOptimisticThread } = useThreads();
  const { user } = useAuth0();

  const handleSubmit = createSubmitHandler(
    props,
    chat,
    isLoading,
    addOptimisticThread,
    user?.email || "",
  );
  const handleActionClick = createActionHandler(chat);

  return {
    handleSubmit,
    handleActionClick,
  };
}
