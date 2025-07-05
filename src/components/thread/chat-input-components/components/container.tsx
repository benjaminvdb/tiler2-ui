import { cn } from "@/lib/utils";
import { ContainerProps } from "../types";

export function Container({
  dragOver,
  chatStarted,
  dropRef,
  children,
}: ContainerProps) {
  return (
    <div
      ref={dropRef}
      className={cn(
        "relative z-10 mx-auto w-full max-w-3xl rounded-2xl bg-white shadow-xs transition-all",
        dragOver
          ? "border-primary border-2 border-dotted"
          : "border border-solid",
        chatStarted && "mb-8",
      )}
    >
      {children}
    </div>
  );
}
