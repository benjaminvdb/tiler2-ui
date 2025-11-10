import React from "react";
import { useStreamContext } from "@/core/providers/stream";
import { AssistantSteps } from "./messages/ai/assistant-steps";

/**
 * StepTracker component displays agent execution steps independently of messages.
 * It appears at the bottom of the chat when the agent is processing and auto-hides when done.
 * This follows LangGraph best practices: steps represent execution tracking, not conversation.
 */
export const StepTracker: React.FC = () => {
  const stream = useStreamContext();
  const steps = stream.values?.steps;

  // Don't render if no steps
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div className="px-4 pb-2">
      <AssistantSteps steps={steps} />
    </div>
  );
};
