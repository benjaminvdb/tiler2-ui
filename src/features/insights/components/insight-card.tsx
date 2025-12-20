import React, { useRef } from "react";
import { Lightbulb, Copy, Trash2 } from "lucide-react";
import type { Insight } from "../types";
import { MarkdownText } from "@/features/thread/components/markdown-text";

interface InsightCardProps {
  insight: Insight;
  copiedId: string | null;
  onCopy: (
    insight: Insight,
    htmlRef: React.RefObject<HTMLDivElement | null>,
  ) => void;
  onDelete: (insightId: string) => void;
  onViewConversation: (threadId: string) => void;
}

export const InsightCard = ({
  insight,
  copiedId,
  onCopy,
  onDelete,
  onViewConversation,
}: InsightCardProps): React.JSX.Element => {
  const markdownRef = useRef<HTMLDivElement>(null);

  const handleCopyClick = () => {
    onCopy(insight, markdownRef);
  };

  const handleDeleteClick = () => {
    onDelete(insight.id);
  };

  const handleViewClick = () => {
    onViewConversation(insight.thread_id);
  };

  return (
    <div
      className="group rounded-lg border border-[var(--border)] bg-white p-5 transition-all duration-200 hover:border-[var(--sage)]"
      style={{
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div className="flex items-start gap-3">
        <Lightbulb
          className="mt-0.5 h-5 w-5 flex-shrink-0"
          style={{ color: "var(--copper)" }}
        />
        <div className="min-w-0 flex-1">
          <div
            ref={markdownRef}
            className="mb-3"
          >
            <MarkdownText>{insight.insight_content}</MarkdownText>
          </div>
          {insight.note && (
            <div className="mb-3 rounded border border-[var(--border)] bg-[var(--sand)] p-3">
              <p className="text-sm text-[var(--muted-foreground)] italic">
                Note: {insight.note}
              </p>
            </div>
          )}
          <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
            <span>
              {new Date(insight.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span>·</span>
            <button
              type="button"
              onClick={handleViewClick}
              className="text-[var(--forest-green)] transition-colors duration-200 hover:underline"
            >
              View conversation
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            onClick={handleCopyClick}
            className="rounded p-2 transition-colors duration-200 hover:bg-[var(--sand)]"
            title="Copy insight"
          >
            <Copy
              className={`h-4 w-4 ${copiedId === insight.id ? "text-[var(--forest-green)]" : "text-[var(--muted-foreground)]"} hover:text-[var(--forest-green)]`}
            />
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="rounded p-2 transition-colors duration-200 hover:bg-[var(--sand)]"
            title="Remove insight"
          >
            <Trash2 className="h-4 w-4 text-[var(--muted-foreground)] hover:text-[var(--destructive)]" />
          </button>
        </div>
      </div>
    </div>
  );
};
