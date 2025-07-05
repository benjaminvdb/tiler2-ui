import { toast } from "sonner";
import { constructOpenInStudioURL } from "../../../utils";

/**
 * Hook for handling opening threads in LangGraph Studio
 */
export function useStudioHandler(
  apiUrl: string | null,
  threadId: string | null,
) {
  const handleOpenInStudio = () => {
    if (!apiUrl) {
      toast.error("Error", {
        description: "Please set the LangGraph deployment URL in settings.",
        duration: 5000,
        richColors: true,
        closeButton: true,
      });
      return;
    }

    const studioUrl = constructOpenInStudioURL(apiUrl, threadId ?? undefined);
    window.open(studioUrl, "_blank");
  };

  return { handleOpenInStudio };
}
