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
};
