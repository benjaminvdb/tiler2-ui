import React, { useState, useEffect } from "react";
import { StepInfo } from "@/core/providers/stream/types";
import { ChevronDown, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface AssistantStepsProps {
  steps: StepInfo[] | undefined;
}

export const AssistantSteps: React.FC<AssistantStepsProps> = ({ steps }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Check if any steps are still running
  const hasRunningSteps = steps?.some((s) => s.status === "running") ?? false;

  // Auto-expand when there are running steps, auto-collapse when all are done
  useEffect(() => {
    if (hasRunningSteps) {
      setIsOpen(true);
    } else if (steps && steps.length > 0) {
      // Only auto-collapse if all steps are completed or errored
      const allDone = steps.every((s) => s.status === "completed" || s.status === "error");
      if (allDone) {
        setIsOpen(false);
      }
    }
  }, [hasRunningSteps, steps]);

  useEffect(() => {
    console.debug("[AssistantSteps] Steps updated:", {
      count: steps?.length ?? 0,
      steps: steps?.map((s) => ({
        id: s.step_id,
        action: s.action,
        status: s.status,
      })),
    });
  }, [steps]);

  if (!steps || steps.length === 0) {
    return null;
  }

  const getStatusIcon = (status: StepInfo["status"]) => {
    switch (status) {
      case "running":
        return (
          <Clock className="h-4 w-4 animate-spin text-amber-500" />
        );
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: StepInfo["status"]) => {
    switch (status) {
      case "running":
        return "Running";
      case "completed":
        return "Completed";
      case "error":
        return "Error";
    }
  };

  const formatDuration = (startedAt: string, completedAt: string | null) => {
    if (!completedAt) return null;

    const start = new Date(startedAt).getTime();
    const end = new Date(completedAt).getTime();
    const durationMs = end - start;

    if (durationMs < 1000) {
      return `${durationMs}ms`;
    }
    return `${(durationMs / 1000).toFixed(1)}s`;
  };

  return (
    <div className="w-full text-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
        <span className="text-xs font-medium">
          Assistant steps ({steps.length})
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 space-y-1 rounded border border-border bg-muted/50 p-2">
          {steps.map((step) => (
            <div
              key={step.step_id}
              className="flex items-start gap-2 rounded p-2 hover:bg-muted"
            >
              <div className="mt-0.5 flex-shrink-0">
                {getStatusIcon(step.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs truncate">
                    {step.action}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {getStatusText(step.status)}
                  </span>
                </div>
                {step.error && (
                  <div className="mt-1 text-xs text-red-600 dark:text-red-400 truncate">
                    {step.error}
                  </div>
                )}
                {step.completed_at && (
                  <div className="text-xs text-muted-foreground">
                    {formatDuration(step.started_at, step.completed_at)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
