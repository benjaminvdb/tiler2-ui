import { cn } from "@/shared/utils/utils";

export const getMainContainerClassName = (chatStarted: boolean) => {
  return cn(
    "relative flex min-w-0 flex-1 flex-col overflow-hidden",
    !chatStarted && "grid-rows-[1fr]",
  );
};

export const getContentClassName = () => {
  return cn(
    "absolute overflow-y-scroll px-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted hover:scrollbar-thumb-accent dark:scrollbar-thumb-accent/30 dark:hover:scrollbar-thumb-accent/50",
    "grid grid-rows-[1fr_auto]",
    "inset-0",
  );
};

export const CONTENT_CONTAINER_CLASS =
  "pt-8 pb-16  max-w-3xl mx-auto flex flex-col gap-4 w-full";
