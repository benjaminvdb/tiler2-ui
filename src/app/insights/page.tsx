import { Lightbulb, Copy, Trash2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { deleteInsight, listInsights } from "@/features/insights/services/insights-api";
import type { Insight } from "@/features/insights/types";

const InsightsHeader = ({ count }: { count: number }): React.JSX.Element => (
  <div className="border-b border-[var(--border)] bg-[var(--card)] px-6 py-5">
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">Insights</h1>
          <p className="text-[var(--muted-foreground)]">
            Key findings and important information saved from your conversations
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Lightbulb className="w-4 h-4" style={{ color: "var(--copper)" }} />
          <span className="text-[var(--muted-foreground)]">
            {count} total insight{count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const EmptyState = (): React.JSX.Element => (
  <div className="text-center py-16">
    <Lightbulb className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
    <h3 className="mb-2">No insights saved yet</h3>
    <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
      As you chat with the AI, highlight text and click &ldquo;Save Insight&rdquo; to capture
      important findings here.
    </p>
  </div>
);

const LoadingState = (): React.JSX.Element => (
  <div className="h-full flex items-center justify-center bg-[var(--background)]">
    <div className="text-center">
      <Lightbulb className="w-8 h-8 mx-auto mb-2 text-[var(--muted-foreground)] animate-pulse" />
      <p className="text-[var(--muted-foreground)]">Loading insights...</p>
    </div>
  </div>
);

const InsightCard = ({
  insight,
  copiedId,
  onCopy,
  onDelete,
  onViewConversation,
}: {
  insight: Insight;
  copiedId: string | null;
  onCopy: (insight: Insight) => void;
  onDelete: (insightId: string) => void;
  onViewConversation: (threadId: string) => void;
}): React.JSX.Element => {
  const handleCopyClick = useCallback(() => {
    onCopy(insight);
  }, [onCopy, insight]);

  const handleDeleteClick = useCallback(() => {
    onDelete(insight.id);
  }, [onDelete, insight.id]);

  const handleViewClick = useCallback(() => {
    onViewConversation(insight.thread_id);
  }, [onViewConversation, insight.thread_id]);

  return (
    <div
      className="bg-white border border-[var(--border)] rounded-lg p-5 hover:border-[var(--sage)] transition-all duration-200 group"
      style={{
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div className="flex items-start gap-3">
        <Lightbulb className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "var(--copper)" }} />
        <div className="flex-1 min-w-0">
          <p className="text-[var(--foreground)] mb-3 leading-relaxed whitespace-pre-wrap">
            {insight.insight_content}
          </p>
          {insight.note && (
            <div className="mb-3 p-3 bg-[var(--sand)] rounded border border-[var(--border)]">
              <p className="text-sm text-[var(--muted-foreground)] italic">Note: {insight.note}</p>
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
              className="text-[var(--forest-green)] hover:underline transition-colors duration-200"
            >
              View conversation
            </button>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={handleCopyClick}
            className="p-2 rounded hover:bg-[var(--sand)] transition-colors duration-200"
            title="Copy insight"
          >
            <Copy
              className={`w-4 h-4 ${copiedId === insight.id ? "text-[var(--forest-green)]" : "text-[var(--muted-foreground)]"} hover:text-[var(--forest-green)]`}
            />
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="p-2 rounded hover:bg-[var(--sand)] transition-colors duration-200"
            title="Remove insight"
          >
            <Trash2 className="w-4 h-4 text-[var(--muted-foreground)] hover:text-[var(--destructive)]" />
          </button>
        </div>
      </div>
    </div>
  );
};

const InsightsPage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const fetch = useAuthenticatedFetch();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setIsLoading(true);
        const response = await listInsights(fetch);
        setInsights(response.insights);
      } catch (error) {
        console.error("Failed to fetch insights:", error);
        toast.error("Failed to load insights");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [fetch]);

  const handleCopy = useCallback(async (insight: Insight) => {
    try {
      await navigator.clipboard.writeText(insight.insight_content);
      setCopiedId(insight.id);
      toast.success("Insight copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = insight.insight_content;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        setCopiedId(insight.id);
        toast.success("Insight copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
      } catch {
        toast.error("Failed to copy insight");
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }, []);

  const handleDelete = useCallback(
    async (insightId: string) => {
      try {
        await deleteInsight(fetch, insightId);
        setInsights((prev) => prev.filter((i) => i.id !== insightId));
        toast.success("Insight removed");
      } catch (error) {
        console.error("Failed to delete insight:", error);
        toast.error("Failed to delete insight");
      }
    },
    [fetch],
  );

  const handleViewConversation = useCallback(
    (threadId: string) => {
      // Navigate to thread page
      navigate(`/?threadId=${threadId}`);
    },
    [navigate],
  );

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="h-full flex flex-col bg-[var(--background)]">
      <InsightsHeader count={insights.length} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {insights.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  copiedId={copiedId}
                  onCopy={handleCopy}
                  onDelete={handleDelete}
                  onViewConversation={handleViewConversation}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
