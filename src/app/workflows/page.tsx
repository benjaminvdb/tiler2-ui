import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { LoadingScreen } from "@/shared/components/loading-spinner";
import { Button } from "@/shared/components/ui/button";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { getClientConfig } from "@/core/config/client";
import { SearchHeader } from "./components/search-header";
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

/**
 * Local workflows shown when the backend cannot provide data.
 */
const BUILT_IN_WORKFLOWS: WorkflowConfig[] = [];

/**
 * Deduplicates backend workflows and merges them with local fallbacks.
 */
const mergeWithBuiltIns = (
  dynamicWorkflows: WorkflowConfig[],
): WorkflowConfig[] => {
  const existingIds = new Set(BUILT_IN_WORKFLOWS.map((workflow) => workflow.workflow_id));
  const uniqueDynamicWorkflows = dynamicWorkflows.filter(
    (workflow) => !existingIds.has(workflow.workflow_id),
  );
  return [...BUILT_IN_WORKFLOWS, ...uniqueDynamicWorkflows].sort(
    (a, b) => a.order_index - b.order_index,
  );
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
            <span
              className="text-[11px] tracking-wider text-white uppercase"
              style={{
                letterSpacing: "0.05em",
                fontWeight: 600,
              }}
            >
              {workflow.category.name}
            </span>
          </div>
        </div>
        <h4
          className="text-foreground group-hover:text-foreground mb-4 transition-colors duration-250"
          style={{
            letterSpacing: "-0.01em",
            lineHeight: "1.4",
            fontSize: "18px",
            fontWeight: 500,
            fontFamily: "var(--font-source-serif-pro), Georgia, serif",
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
        My option isn&apos;t here – discuss another{" "}
        {categoryName.toLowerCase()} matter
      </button>
    </div>
  );
});

interface CategorySectionProps {
  categoryName: string;
  categoryWorkflows: WorkflowConfig[];
  categoryIndex: number;
  totalCategories: number;
  categoryRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  onWorkflowClick: (workflowId: string) => void;
}

const CategorySection = React.memo(function CategorySection({
  categoryName,
  categoryWorkflows,
  categoryIndex,
  totalCategories,
  categoryRefs,
  onWorkflowClick,
}: CategorySectionProps) {
  const category = categoryWorkflows[0].category;
  const categoryColor = getCategoryColorByName(categoryName);
  const isOnboarding = categoryName === "Onboarding";
  const isLastCategory = categoryIndex === totalCategories - 1;
  const fallbackWorkflow = categoryWorkflows.find((w) => w.order_index === 0);

  return (
    <motion.section
      ref={(el) => {
        if (el) {
          categoryRefs.current[categoryName] = el;
        }
      }}
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

const WorkflowsPage = (): React.ReactNode => {
  const { navigationService } = useUIContext();
  const { apiUrl } = getClientConfig();
  const [workflows, setWorkflows] =
    useState<WorkflowConfig[]>(BUILT_IN_WORKFLOWS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fetchWithAuth = useAuthenticatedFetch();

  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true);

        if (!apiUrl) {
          throw new Error("API URL not configured");
        }

        const response = await fetchWithAuth(`${apiUrl}/workflows`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const dynamicWorkflows: WorkflowConfig[] = await response.json();
          setWorkflows(mergeWithBuiltIns(dynamicWorkflows));
          setError(null);
        } else {
          throw new Error(`Failed to fetch workflows: ${response.statusText}`);
        }
      } catch (err) {
        console.error("Error fetching dynamic workflows:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dynamic workflows",
        );
        setWorkflows(BUILT_IN_WORKFLOWS);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, [apiUrl, fetchWithAuth]);

  const filteredWorkflows = useMemo(() => {
    if (!searchQuery.trim()) {
      return workflows;
    }

    const query = searchQuery.toLowerCase();
    return workflows.filter(
      (w) =>
        w.title.toLowerCase().includes(query) ||
        w.description.toLowerCase().includes(query),
    );
  }, [workflows, searchQuery]);

  const workflowsByCategory = useMemo(() => {
    const grouped: Record<string, WorkflowConfig[]> = {};

    filteredWorkflows.forEach((workflow) => {
      const categoryName = workflow.category.name;
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(workflow);
    });

    const sortedCategories = Object.entries(grouped).sort(
      ([, workflowsA], [, workflowsB]) => {
        return (
          workflowsA[0].category.order_index -
          workflowsB[0].category.order_index
        );
      },
    );

    return Object.fromEntries(sortedCategories);
  }, [filteredWorkflows]);

  const categories = useMemo(() => {
    const categoriesWithWorkflows = Object.values(workflowsByCategory)
      .map((workflows) => workflows[0].category)
      .filter((cat) => cat.name !== "Onboarding")
      .sort((a, b) => a.order_index - b.order_index);

    return categoriesWithWorkflows;
  }, [workflowsByCategory]);

  const scrollToCategory = useCallback((categoryName: string) => {
    categoryRefs.current[categoryName]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const handleWorkflowClick = useCallback(
    (workflowId: string) => {
      navigationService.navigateToWorkflow(workflowId);
    },
    [navigationService],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  const showBuiltInOnly =
    !loading && workflows.length === BUILT_IN_WORKFLOWS.length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <SearchHeader
        searchQuery={searchQuery}
        filteredCount={filteredWorkflows.length}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
      />

      <StatusMessages
        error={error}
        loading={loading}
        showBuiltInOnly={showBuiltInOnly}
      />

      {!searchQuery.trim() && (
        <CategoryNavigation
          categories={categories}
          onCategoryClick={scrollToCategory}
        />
      )}

      {searchQuery.trim() ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkflows.map((workflow, index) => (
            <WorkflowCard
              key={workflow.workflow_id}
              workflow={workflow}
              index={index}
              onWorkflowClick={handleWorkflowClick}
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
                categoryRefs={categoryRefs}
                onWorkflowClick={handleWorkflowClick}
              />
            ),
          )}
        </div>
      )}
      {filteredWorkflows.length === 0 && (
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
            onClick={handleClearSearch}
            className="mt-4"
          >
            Clear search
          </Button>
        </motion.div>
      )}
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
    </div>
  );
};

export default WorkflowsPage;
