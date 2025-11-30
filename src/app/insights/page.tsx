import { Lightbulb, Copy, Trash2 } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import {
  deleteInsight,
  listInsights,
} from "@/features/insights/services/insights-api";
import type { Insight } from "@/features/insights/types";
import { MarkdownText } from "@/features/thread/components/markdown-text";
import { Page } from "@/shared/components/ui/page";
import { PageContent } from "@/shared/components/ui/page-content";
import { PageHeader } from "@/shared/components/ui/page-header";
import { copyWithFormat } from "@/shared/utils/clipboard";

const EmptyState = (): React.JSX.Element => (
  <div className="py-16 text-center">
    <Lightbulb className="mx-auto mb-4 h-12 w-12 text-[var(--muted-foreground)]" />
    <h3 className="mb-2 text-lg font-medium">No insights saved yet</h3>
    <p className="mx-auto max-w-md text-[var(--muted-foreground)]">
      As you chat with the AI, highlight text and click &ldquo;Save
      Insight&rdquo; to capture important findings here.
    </p>
  </div>
);

const LoadingState = (): React.JSX.Element => (
  <div className="flex h-full items-center justify-center bg-[var(--background)]">
    <div className="text-center">
      <Lightbulb className="mx-auto mb-2 h-8 w-8 animate-pulse text-[var(--muted-foreground)]" />
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
  onCopy: (
    insight: Insight,
    htmlRef: React.RefObject<HTMLDivElement | null>,
  ) => void;
  onDelete: (insightId: string) => void;
  onViewConversation: (threadId: string) => void;
}): React.JSX.Element => {
  const markdownRef = useRef<HTMLDivElement>(null);

  const handleCopyClick = useCallback(() => {
    onCopy(insight, markdownRef);
  }, [onCopy, insight]);

  const handleDeleteClick = useCallback(() => {
    onDelete(insight.id);
  }, [onDelete, insight.id]);

  const handleViewClick = useCallback(() => {
    onViewConversation(insight.thread_id);
  }, [onViewConversation, insight.thread_id]);

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

        {/* Action Icons */}
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

  const handleCopy = useCallback(
    async (
      insight: Insight,
      htmlRef: React.RefObject<HTMLDivElement | null>,
    ) => {
      const success = await copyWithFormat({
        markdownText: insight.insight_content,
        htmlContainerRef: htmlRef,
      });

      if (success) {
        setCopiedId(insight.id);
        toast.success("Insight copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
      } else {
        toast.error("Failed to copy insight");
      }
    },
    [],
  );

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
      navigate(`/?threadId=${threadId}`);
    },
    [navigate],
  );

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <Page>
      <PageHeader
        title="Insights"
        subtitle="Key findings and important information saved from your conversations"
        badge={{
          icon: Lightbulb,
          label: `${insights.length} insight${insights.length !== 1 ? "s" : ""}`,
          iconColor: "var(--copper)",
        }}
      />
      <PageContent>
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
      </PageContent>
    </Page>
  );
};

export default InsightsPage;
