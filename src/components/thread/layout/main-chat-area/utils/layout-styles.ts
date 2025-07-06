import { cn } from "@/lib/utils";

export const getMainContainerClassName = (chatStarted: boolean) => {
  return cn(
    "relative flex min-w-0 flex-1 flex-col overflow-hidden",
    !chatStarted && "grid-rows-[1fr]",
  );
};

export const getContentClassName = (chatStarted: boolean) => {
  return cn(
    "absolute inset-0 overflow-y-scroll px-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent",
    !chatStarted && "mt-[25vh] flex flex-col items-stretch",
    chatStarted && "grid grid-rows-[1fr_auto]",
  );
};

export const CONTENT_CONTAINER_CLASS =
  "pt-8 pb-16  max-w-3xl mx-auto flex flex-col gap-4 w-full";
