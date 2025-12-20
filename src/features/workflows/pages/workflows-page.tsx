/** Workflows page displaying categorized workflow cards with search and navigation. */

import React from "react";
import { Workflow } from "lucide-react";
import { LoadingScreen } from "@/shared/components/loading-spinner";
import { Page } from "@/shared/components/ui/page";
import { PageContent } from "@/shared/components/ui/page-content";
import { PageHeader } from "@/shared/components/ui/page-header";
import { CategoryNavigation } from "../components/category-navigation";
import { StatusMessages } from "../components/status-messages";
import { WorkflowsContent } from "../components/workflows-content";
import { WorkflowsToolbar } from "../components/workflows-toolbar";
import { useWorkflowsPage } from "../hooks/use-workflows-page";

const WorkflowsPage = (): React.ReactNode => {
  const {
    loading,
    error,
    searchQuery,
    filteredWorkflows,
    workflowsByCategory,
    categories,
    totalWorkflows,
    setCategoryRef,
    scrollToCategory,
    handleWorkflowClick,
    handleSearchChange,
    handleClearSearch,
  } = useWorkflowsPage();

  if (loading) return <LoadingScreen />;

  return (
    <Page>
      <PageHeader
        title="Sustainability Workflows"
        subtitle="Select a workflow to begin your sustainability analysis"
        badge={{
          icon: Workflow,
          label: `${filteredWorkflows.length} workflow${filteredWorkflows.length !== 1 ? "s" : ""}`,
          iconColor: "var(--forest-green)",
        }}
      />

      <PageContent>
        <WorkflowsToolbar
          searchQuery={searchQuery}
          filteredCount={filteredWorkflows.length}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
        />

        <StatusMessages
          error={error}
          loading={loading}
        />

        {!searchQuery.trim() && (
          <CategoryNavigation
            categories={categories}
            onCategoryClick={scrollToCategory}
          />
        )}

        <WorkflowsContent
          searchQuery={searchQuery}
          filteredWorkflows={filteredWorkflows}
          workflowsByCategory={workflowsByCategory}
          totalWorkflows={totalWorkflows}
          setCategoryRef={setCategoryRef}
          onWorkflowClick={handleWorkflowClick}
          onClearSearch={handleClearSearch}
        />
      </PageContent>
    </Page>
  );
};

export default WorkflowsPage;
