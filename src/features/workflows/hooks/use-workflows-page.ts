import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { useWorkflows } from "./use-workflows";
import type { WorkflowConfig, CategoryResponse } from "../types";

// Filters workflows and groups them for category-based rendering.
const useWorkflowFiltering = (
  workflows: WorkflowConfig[],
  searchQuery: string,
) => {
  const filteredWorkflows = !searchQuery.trim()
    ? workflows
    : workflows.filter((workflow) => {
        const query = searchQuery.toLowerCase();
        return (
          workflow.title.toLowerCase().includes(query) ||
          workflow.description.toLowerCase().includes(query)
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
    .filter((category) => category.name !== "Onboarding")
    .sort((a, b) => a.order_index - b.order_index);

  return { filteredWorkflows, workflowsByCategory, categories };
};

interface WorkflowsPageState {
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filteredWorkflows: WorkflowConfig[];
  workflowsByCategory: Record<string, WorkflowConfig[]>;
  categories: CategoryResponse[];
  totalWorkflows: number;
  setCategoryRef: (categoryName: string, el: HTMLElement | null) => void;
  scrollToCategory: (categoryName: string) => void;
  handleWorkflowClick: (workflowId: string) => void;
  handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleClearSearch: () => void;
}

export const useWorkflowsPage = (): WorkflowsPageState => {
  const { navigationService } = useUIContext();
  const [searchQuery, setSearchQuery] = useState("");
  const categoryRefsRef = useRef<Record<string, HTMLElement | null>>({});
  const hasScrolledToHash = useRef(false);

  const {
    workflows: rawWorkflows,
    isLoading: loading,
    error: swrError,
  } = useWorkflows();

  const workflows = [...rawWorkflows].sort(
    (a, b) => a.order_index - b.order_index,
  );
  const error = swrError?.message ?? null;
  const { filteredWorkflows, workflowsByCategory, categories } =
    useWorkflowFiltering(workflows, searchQuery);

  const setCategoryRef = (categoryName: string, el: HTMLElement | null) => {
    categoryRefsRef.current[categoryName] = el;
  };

  const scrollToCategory = (categoryName: string) => {
    categoryRefsRef.current[categoryName]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleWorkflowClick = (workflowId: string) =>
    navigationService.navigateToWorkflow(workflowId);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(e.target.value);

  const handleClearSearch = () => setSearchQuery("");

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
};
