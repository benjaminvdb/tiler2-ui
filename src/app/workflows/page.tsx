import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { Workflow } from "lucide-react";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { LoadingScreen } from "@/shared/components/loading-spinner";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Page } from "@/shared/components/ui/page";
import { PageContent } from "@/shared/components/ui/page-content";
import { PageHeader } from "@/shared/components/ui/page-header";
import { useWorkflows } from "@/core/hooks";
import { WorkflowsToolbar } from "./components/workflows-toolbar";
import { StatusMessages } from "./components/status-messages";
import { CategoryNavigation } from "./components/category-navigation";

interface CategoryResponse {
  id: number;
  name: string;
  color: string;
  icon_name: string;
  order_index: number;
}

interface WorkflowConfig {
  id: number;
  workflow_id: string;
  title: string;
  description: string;
  icon: string;
  icon_color: string;
  order_index: number;
  category: CategoryResponse;
}

const toPascalCase = (value: string): string =>
  value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\s+/g, "");

const lucideIconLibrary = LucideIcons as unknown as Record<
  string,
  React.ComponentType<{ className?: string }>
>;

/**
 * Resolves the correct Lucide icon for a workflow by name.
 */
const getWorkflowIcon = (iconName: string): React.ReactNode => {
  const iconComponentName = toPascalCase(iconName);
  const IconComponent =
    lucideIconLibrary[iconComponentName] ?? LucideIcons.HelpCircle;
  return <IconComponent className="h-5 w-5" />;
};

/**
 * Palette used for workflow category badges/backgrounds.
 */
const CATEGORY_COLORS: Record<string, string> = {
  Onboarding: "#767C91",
  Strategy: "#82889f",
  "Policies & Governance": "#7ca2b7",
  "Impacts & Risk Assessment": "#72a6a6",
  Interventions: "#a6c887",
  "Standards & Reporting": "#e39c5a",
  "Stakeholder Engagement": "#ac876c",
  "Knowledge & Guidance": "#878879",
};

const getCategoryColorByName = (categoryName: string): string => {
  return CATEGORY_COLORS[categoryName] ?? CATEGORY_COLORS.Onboarding;
};

/**
 * Decorative imagery displayed behind each workflow card.
 */
const CATEGORY_ILLUSTRATIONS: Record<string, string> = {
  Onboarding: "/fern.png",
  Strategy: "/fern.png",
  "Policies & Governance": "/beetle.png",
  "Impacts & Risk Assessment": "/leaves.png",
  Interventions: "/fern.png",
  "Standards & Reporting": "/leaves.png",
  "Stakeholder Engagement": "/beetle.png",
  "Knowledge & Guidance": "/leaves.png",
};

const getCategoryIllustration = (categoryName: string): string => {
  return CATEGORY_ILLUSTRATIONS[categoryName] ?? "/leaves.png";
};

interface WorkflowCardProps {
  workflow: WorkflowConfig;
  index: number;
  onWorkflowClick: (workflowId: string) => void;
}

const WorkflowCard = React.memo(function WorkflowCard({
  workflow,
  index,
  onWorkflowClick,
}: WorkflowCardProps) {
  const categoryColor = getCategoryColorByName(workflow.category.name);
  const illustrationSrc = getCategoryIllustration(workflow.category.name);

  const handleClick = useCallback(() => {
    onWorkflowClick(workflow.workflow_id);
  }, [onWorkflowClick, workflow.workflow_id]);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ y: -1, transition: { duration: 0.2 } }}
      onClick={handleClick}
      className="group border-border relative w-full overflow-hidden rounded-lg border bg-white text-left transition-all duration-250 hover:border-transparent"
      style={{
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        minHeight: "280px",
      }}
    >
      {illustrationSrc && (
        <img
          src={illustrationSrc}
          alt=""
          className="pointer-events-none absolute right-0 bottom-0 h-48 w-48 object-contain"
          style={{
            opacity: 0.15,
            transform: "translate(20%, 20%) scale(1.4)",
          }}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-250 group-hover:opacity-100"
        style={{
          boxShadow: `0 12px 40px ${categoryColor}20`,
        }}
      />

      <div className="relative z-10 flex h-full flex-col px-7 pt-7 pb-8">
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1"
            style={{
              backgroundColor: categoryColor,
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            <span className="flex h-3 w-3 items-center justify-center text-white">
              {getWorkflowIcon(workflow.category.icon_name)}
            </span>
            <span className="text-[11px] font-normal tracking-wider text-white uppercase">
              {workflow.category.name}
            </span>
          </div>
        </div>
        <h4
          className="text-foreground group-hover:text-foreground mb-4 font-serif transition-colors duration-250"
          style={{
            letterSpacing: "-0.01em",
            lineHeight: "1.4",
            fontSize: "18px",
            fontWeight: 500,
          }}
        >
          {workflow.title}
        </h4>
        <p
          className="text-muted-foreground leading-relaxed"
          style={{
            lineHeight: "1.7",
            letterSpacing: "-0.003em",
            fontSize: "14px",
            opacity: 0.85,
          }}
        >
          {workflow.description}
        </p>
      </div>
    </motion.button>
  );
});

interface FallbackLinkProps {
  workflow: WorkflowConfig;
  categoryName: string;
  onNavigate: (workflowId: string) => void;
}

const FallbackLink = React.memo(function FallbackLink({
  workflow,
  categoryName,
  onNavigate,
}: FallbackLinkProps) {
  const handleClick = useCallback(() => {
    onNavigate(workflow.workflow_id);
  }, [onNavigate, workflow.workflow_id]);

  return (
    <div className="mt-5 text-center">
      <button
        type="button"
        onClick={handleClick}
        className="text-muted-foreground decoration-muted-foreground/30 hover:text-foreground hover:decoration-foreground/50 text-[14px] underline decoration-1 underline-offset-4 transition-colors duration-250"
        style={{
          letterSpacing: "-0.003em",
        }}
      >
        My option isn&apos;t here – discuss another {categoryName.toLowerCase()}{" "}
        matter
      </button>
    </div>
  );
});

interface CategorySectionProps {
  categoryName: string;
  categoryWorkflows: WorkflowConfig[];
  categoryIndex: number;
  totalCategories: number;
  setCategoryRef: (categoryName: string, el: HTMLElement | null) => void;
  onWorkflowClick: (workflowId: string) => void;
}

const CategorySection = React.memo(function CategorySection({
  categoryName,
  categoryWorkflows,
  categoryIndex,
  totalCategories,
  setCategoryRef,
  onWorkflowClick,
}: CategorySectionProps) {
  const category = categoryWorkflows[0].category;
  const categoryColor = getCategoryColorByName(categoryName);
  const isOnboarding = categoryName === "Onboarding";
  const isLastCategory = categoryIndex === totalCategories - 1;
  const fallbackWorkflow = categoryWorkflows.find((w) => w.order_index === 0);

  const handleRef = useCallback(
    (el: HTMLElement | null) => {
      setCategoryRef(categoryName, el);
    },
    [categoryName, setCategoryRef],
  );

  return (
    <motion.section
      ref={handleRef}
      data-category={categoryName}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.5,
        delay: categoryIndex * 0.1,
        ease: [0.4, 0, 0.2, 1],
      }}
      style={{ scrollMarginTop: "2rem" }}
      className={`${isLastCategory ? "mb-6" : "mb-16"} pb-12 ${
        !isLastCategory
          ? `border-b ${isOnboarding ? "border-border border-b-2" : "border-gray-200"}`
          : ""
      }`}
    >
      <div className="mb-6 flex items-center gap-3">
        <div
          className={`flex items-center justify-center rounded-lg ${isOnboarding ? "h-12 w-12" : "h-10 w-10"}`}
          style={{
            backgroundColor: `${categoryColor}${isOnboarding ? "20" : "15"}`,
            boxShadow: isOnboarding
              ? `0 2px 8px ${categoryColor}15`
              : undefined,
          }}
        >
          <div
            className={`${isOnboarding ? "h-6 w-6" : "h-5 w-5"} flex items-center justify-center`}
            style={{ color: categoryColor, strokeWidth: 1.5 }}
          >
            {getWorkflowIcon(category.icon_name)}
          </div>
        </div>
        <div>
          <h2
            className="font-serif text-[24px] font-normal text-[rgb(20,32,26)]"
            style={{ letterSpacing: "0.01em" }}
          >
            {categoryName}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categoryWorkflows.map((workflow, workflowIndex) => (
          <WorkflowCard
            key={workflow.workflow_id}
            workflow={workflow}
            index={workflowIndex}
            onWorkflowClick={onWorkflowClick}
          />
        ))}
      </div>
      {fallbackWorkflow && (
        <FallbackLink
          workflow={fallbackWorkflow}
          categoryName={categoryName}
          onNavigate={onWorkflowClick}
        />
      )}
    </motion.section>
  );
});

/**
 * Hook to filter and organize workflows by category
 */
function useWorkflowFiltering(
  workflows: WorkflowConfig[],
  searchQuery: string,
) {
  const filteredWorkflows = !searchQuery.trim()
    ? workflows
    : workflows.filter((w) => {
        const query = searchQuery.toLowerCase();
        return (
          w.title.toLowerCase().includes(query) ||
          w.description.toLowerCase().includes(query)
        );
      });

  const grouped: Record<string, WorkflowConfig[]> = {};
  filteredWorkflows.forEach((workflow) => {
    const categoryName = workflow.category.name;
    if (!grouped[categoryName]) {
      grouped[categoryName] = [];
    }
    grouped[categoryName].push(workflow);
  });

  const sortedCategories = Object.entries(grouped).sort(
    ([, workflowsA], [, workflowsB]) =>
      workflowsA[0].category.order_index - workflowsB[0].category.order_index,
  );

  const workflowsByCategory = Object.fromEntries(sortedCategories);

  const categories = Object.values(workflowsByCategory)
    .map((workflows) => workflows[0].category)
    .filter((cat) => cat.name !== "Onboarding")
    .sort((a, b) => a.order_index - b.order_index);

  return { filteredWorkflows, workflowsByCategory, categories };
}

/**
 * Renders the main content area with workflows or search results
 */
interface WorkflowsContentProps {
  searchQuery: string;
  filteredWorkflows: WorkflowConfig[];
  workflowsByCategory: Record<string, WorkflowConfig[]>;
  totalWorkflows: number;
  setCategoryRef: (categoryName: string, el: HTMLElement | null) => void;
  onWorkflowClick: (workflowId: string) => void;
  onClearSearch: () => void;
}

const WorkflowsContent: React.FC<WorkflowsContentProps> = ({
  searchQuery,
  filteredWorkflows,
  workflowsByCategory,
  totalWorkflows,
  setCategoryRef,
  onWorkflowClick,
  onClearSearch,
}) => {
  // No workflows at all - show empty state
  if (totalWorkflows === 0 && !searchQuery.trim()) {
    return (
      <EmptyState
        icon={Workflow}
        title="No workflows available"
        subtitle="Workflows will appear here once they are configured in your organization."
      />
    );
  }

  return (
    <>
      {searchQuery.trim() ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkflows.map((workflow, index) => (
            <WorkflowCard
              key={workflow.workflow_id}
              workflow={workflow}
              index={index}
              onWorkflowClick={onWorkflowClick}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(workflowsByCategory).map(
            ([categoryName, categoryWorkflows], categoryIndex) => (
              <CategorySection
                key={categoryName}
                categoryName={categoryName}
                categoryWorkflows={categoryWorkflows}
                categoryIndex={categoryIndex}
                totalCategories={Object.entries(workflowsByCategory).length}
                setCategoryRef={setCategoryRef}
                onWorkflowClick={onWorkflowClick}
              />
            ),
          )}
        </div>
      )}

      {/* Show "no results" only when actively searching */}
      {filteredWorkflows.length === 0 && searchQuery.trim() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground py-12 text-center"
        >
          <p className="text-lg">
            No workflows found matching &ldquo;{searchQuery}&rdquo;
          </p>
          <Button
            variant="ghost"
            onClick={onClearSearch}
            className="mt-4"
          >
            Clear search
          </Button>
        </motion.div>
      )}

      {/* Footer only when workflows exist */}
      {filteredWorkflows.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="border-border mt-16 border-t pt-8"
        >
          <p className="text-muted-foreground text-center text-sm">
            Can&apos;t find what you&apos;re looking for? Start a new chat to
            discuss your specific needs.
          </p>
        </motion.div>
      )}
    </>
  );
};

/**
 * Custom hook for workflows page state and handlers
 */
function useWorkflowsPage() {
  const { navigationService } = useUIContext();
  const [searchQuery, setSearchQuery] = useState("");
  const categoryRefsRef = useRef<Record<string, HTMLElement | null>>({});
  const hasScrolledToHash = useRef(false);

  const {
    workflows: rawWorkflows,
    isLoading: loading,
    error: swrError,
  } = useWorkflows();

  const workflows = useMemo(
    () => [...rawWorkflows].sort((a, b) => a.order_index - b.order_index),
    [rawWorkflows],
  );
  const error = swrError?.message ?? null;
  const { filteredWorkflows, workflowsByCategory, categories } =
    useWorkflowFiltering(workflows, searchQuery);

  const setCategoryRef = useCallback(
    (categoryName: string, el: HTMLElement | null) => {
      categoryRefsRef.current[categoryName] = el;
    },
    [],
  );

  const scrollToCategory = useCallback((categoryName: string) => {
    categoryRefsRef.current[categoryName]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const handleWorkflowClick = useCallback(
    (workflowId: string) => navigationService.navigateToWorkflow(workflowId),
    [navigationService],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value),
    [],
  );

  const handleClearSearch = useCallback(() => setSearchQuery(""), []);

  // Scroll to hash on initial load
  useEffect(() => {
    if (!loading && !hasScrolledToHash.current && window.location.hash) {
      const hash = decodeURIComponent(window.location.hash.substring(1));
      if (hash && categoryRefsRef.current[hash]) {
        setTimeout(() => {
          categoryRefsRef.current[hash]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          hasScrolledToHash.current = true;
        }, 100);
      }
    }
  }, [loading, workflowsByCategory]);

  return {
    loading,
    error,
    searchQuery,
    filteredWorkflows,
    workflowsByCategory,
    categories,
    totalWorkflows: workflows.length,
    setCategoryRef,
    scrollToCategory,
    handleWorkflowClick,
    handleSearchChange,
    handleClearSearch,
  };
}

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
