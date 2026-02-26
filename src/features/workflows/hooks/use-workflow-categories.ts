/**
 * Hook for extracting unique workflow categories.
 */

import { useWorkflows } from "./use-workflows";
import type { CategoryResponse } from "../types";

/** Returns deduplicated categories from workflows, sorted by order_index. */
export function useWorkflowCategories(excludeOnboarding = true) {
  const { workflows, isLoading, error } = useWorkflows();

  const categoryMap: Record<number, CategoryResponse> = {};
  workflows.forEach((workflow) => {
    if (!excludeOnboarding || workflow.category.name !== "Onboarding") {
      categoryMap[workflow.category.id] = workflow.category;
    }
  });
  const categories = Object.values(categoryMap).sort(
    (a, b) => a.order_index - b.order_index,
  );

  return { categories, isLoading, error };
}
