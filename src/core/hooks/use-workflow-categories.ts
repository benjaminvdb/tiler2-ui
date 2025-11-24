import { useMemo } from "react";
import { useWorkflows, type CategoryResponse } from "./use-workflows";

export function useWorkflowCategories(excludeOnboarding = true) {
  const { workflows, isLoading, error } = useWorkflows();

  const categories = useMemo(() => {
    const categoryMap: Record<number, CategoryResponse> = {};
    workflows.forEach((workflow) => {
      if (!excludeOnboarding || workflow.category.name !== "Onboarding") {
        categoryMap[workflow.category.id] = workflow.category;
      }
    });
    return Object.values(categoryMap).sort(
      (a, b) => a.order_index - b.order_index
    );
  }, [workflows, excludeOnboarding]);

  return { categories, isLoading, error };
}
