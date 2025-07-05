import { MessageSquare } from "lucide-react";
import { InterruptIndicatorProps } from "../types";

export function InterruptIndicator({
  isRespondingToInterrupt,
}: InterruptIndicatorProps) {
  if (!isRespondingToInterrupt) return null;

  return (
    <div className="mx-3.5 mb-2 flex items-center gap-2 text-xs text-blue-600">
      <MessageSquare className="h-3 w-3" />
      <span>Responding to the assistant's question</span>
    </div>
  );
}
