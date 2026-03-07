/** Insights page displaying saved findings from AI conversations with copy/delete actions. */

import { Lightbulb } from "lucide-react";
import { useState, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { deleteInsight } from "@/features/insights/services/insights-api";
import type { Insight } from "@/features/insights/types";
import { InsightCard } from "@/features/insights/components/insight-card";
import { InsightsLoadingState } from "@/features/insights/components/insights-loading-state";
import { useInsights } from "@/features/insights/hooks/use-insights";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Page } from "@/shared/components/ui/page";
import { PageContent } from "@/shared/components/ui/page-content";
import { PageHeader } from "@/shared/components/ui/page-header";
import { copyWithFormat } from "@/shared/utils/clipboard";

const InsightsPage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const fetchWithAuth = useAuthenticatedFetch();
  const { insights, isLoading, mutate } = useInsights();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (
    insight: Insight,
    htmlRef: RefObject<HTMLDivElement | null>,
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
  };

  const handleDelete = async (insightId: string) => {
    try {
      await deleteInsight(fetchWithAuth, insightId);
      mutate();
      toast.success("Insight removed");
    } catch (error) {
      console.error("Failed to delete insight:", error);
      toast.error("Failed to delete insight");
    }
  };

  const handleViewConversation = (threadId: string) => {
    navigate(`/?threadId=${threadId}`);
  };

  if (isLoading) {
    return <InsightsLoadingState />;
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
          <EmptyState
            icon={Lightbulb}
            title="No insights saved yet"
            subtitle='As you chat with the AI, highlight text and click "Save Insight" to capture important findings here.'
          />
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
