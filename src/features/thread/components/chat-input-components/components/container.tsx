import { cn } from "@/shared/utils/utils";
import { ContainerProps } from "../types";

export const Container: React.FC<ContainerProps> = ({
  dragOver,
  chatStarted,
  dropRef,
  children,
}) => {
  return (
    <div
      ref={dropRef}
      className={cn(
        "bg-sand focus-within:border-sage relative z-10 mx-auto w-full max-w-3xl rounded-lg transition-all focus-within:shadow-sm",
        dragOver
          ? "border-primary border-2 border-dotted"
          : "border-border border",
        chatStarted && "mb-8",
      )}
      style={{
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
      }}
    >
      {children}
    </div>
  );
};
