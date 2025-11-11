"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { LoadingScreen } from "@/shared/components/loading-spinner";
import { Button } from "@/shared/components/ui/button";
import * as LucideIcons from "lucide-react";
import { fetchWithAuth } from "@/core/services/http-client";
import { useRuntimeClientConfig } from "@/core/config/use-runtime-config";

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

// Dynamic Lucide icon mapping
const getWorkflowIcon = (iconName: string): React.ReactNode => {
  // Convert icon name to PascalCase for Lucide component names
  const toPascalCase = (str: string): string => {
    return str
      .replace(/[-_]/g, " ") // Replace hyphens and underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
      .replace(/\s+/g, ""); // Remove spaces
  };

  const iconComponentName = toPascalCase(iconName);
  const IconComponent = (
    LucideIcons as unknown as Record<
      string,
      React.ComponentType<{ className?: string }>
    >
  )[iconComponentName];

  if (IconComponent) {
    return <IconComponent className="h-5 w-5" />;
  }

  // Fallback to HelpCircle if icon not found
  return <LucideIcons.HelpCircle className="h-5 w-5" />;
};

// Map category names to reference design colors
const getCategoryColorByName = (categoryName: string): string => {
  const colorMap: Record<string, string> = {
    Onboarding: "#767C91", // slate-gray
    Strategy: "#82889f", // cool-gray
    "Policies & Governance": "#7ca2b7", // air-superiority-blue
    "Impacts & Risk Assessment": "#72a6a6", // verdigris
    Interventions: "#a6c887", // olivine
    "Standards & Reporting": "#e39c5a", // sandy-brown
    "Stakeholder Engagement": "#ac876c", // beaver
    "Knowledge & Guidance": "#878879", // battleship-gray
  };
  return colorMap[categoryName] || "#767C91";
};

// Map category names to illustration images
const getCategoryIllustration = (categoryName: string): string => {
  const illustrationMap: Record<string, string> = {
    Onboarding: "/fern.png",
    Strategy: "/fern.png",
    "Policies & Governance": "/beetle.png",
    "Impacts & Risk Assessment": "/leaves.png",
    Interventions: "/fern.png",
    "Standards & Reporting": "/leaves.png",
    "Stakeholder Engagement": "/beetle.png",
    "Knowledge & Guidance": "/leaves.png",
  };
  return illustrationMap[categoryName] || "/leaves.png";
};

// Hard-coded built-in workflows that are always available
// Note: These are fallback workflows if backend is unavailable
const BUILT_IN_WORKFLOWS: WorkflowConfig[] = [];

export default function WorkflowsPage(): React.ReactNode {
  const { navigationService } = useUIContext();
  const { apiUrl } = useRuntimeClientConfig();
  const [workflows, setWorkflows] =
    useState<WorkflowConfig[]>(BUILT_IN_WORKFLOWS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Refs for category sections (for smooth scrolling)
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});

  // Fetch dynamic workflows from backend API and combine with built-in ones
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true);

        // Call backend API with automatic authentication and 403 handling
        const response = await fetchWithAuth(`${apiUrl}/workflows`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const dynamicWorkflows: WorkflowConfig[] = await response.json();
          console.log(
            `[Workflows API] Received ${dynamicWorkflows.length} workflows from backend`,
          );

          // Combine built-in workflows with dynamic ones
          // Filter out any duplicates based on workflow_id
          const existingIds = new Set(
            BUILT_IN_WORKFLOWS.map((w) => w.workflow_id),
          );
          const uniqueDynamicWorkflows = dynamicWorkflows.filter(
            (w) => !existingIds.has(w.workflow_id),
          );
          console.log(
            `[Workflows API] After filtering duplicates: ${uniqueDynamicWorkflows.length} unique dynamic workflows`,
          );

          // Combine and sort by order_index
          const combinedWorkflows = [
            ...BUILT_IN_WORKFLOWS,
            ...uniqueDynamicWorkflows,
          ].sort((a, b) => a.order_index - b.order_index);
          console.log(
            `[Workflows API] Total workflows to display: ${combinedWorkflows.length}`,
          );

          setWorkflows(combinedWorkflows);
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

        // Keep built-in workflows even if dynamic fetch fails
        setWorkflows(BUILT_IN_WORKFLOWS);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, [apiUrl]);

  // Filter workflows based on search query
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

  // Group workflows by category (memoized for performance)
  const workflowsByCategory = useMemo(() => {
    const grouped: Record<string, WorkflowConfig[]> = {};

    filteredWorkflows.forEach((workflow) => {
      const categoryName = workflow.category.name;
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(workflow);
    });

    // Sort categories by order_index
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

  // Extract unique categories for navigation pills (excluding Onboarding)
  // Derive from workflowsByCategory to ensure pills only show for categories with workflows
  const categories = useMemo(() => {
    const categoriesWithWorkflows = Object.values(workflowsByCategory)
      .map((workflows) => workflows[0].category)
      .filter((cat) => cat.name !== "Onboarding")
      .sort((a, b) => a.order_index - b.order_index);

    return categoriesWithWorkflows;
  }, [workflowsByCategory]);

  // Scroll to category section
  const scrollToCategory = (categoryName: string) => {
    categoryRefs.current[categoryName]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleWorkflowClick = (workflowId: string) => {
    navigationService.navigateToWorkflow(workflowId);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="mb-12"
      >
        <h1
          className="mb-3 font-serif text-3xl"
          style={{ letterSpacing: "0.01em" }}
        >
          Sustainability Workflows
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          Select a workflow to begin. Each workflow guides you through a
          specific sustainability task with tailored intelligence and best
          practices.
        </p>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="mt-8 mb-6"
        >
          <div className="relative max-w-xl">
            <LucideIcons.Search
              className="text-muted-foreground absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2"
              strokeWidth={2}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflows..."
              className="border-border text-foreground placeholder:text-muted-foreground focus:ring-sage w-full rounded-lg border bg-white py-3 pr-10 pl-11 focus:border-transparent focus:ring-2 focus:outline-none"
              style={{
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="hover:bg-sand absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 transition-colors duration-250"
              >
                <LucideIcons.X
                  className="text-muted-foreground h-4 w-4"
                  strokeWidth={2}
                />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-muted-foreground mt-3 text-[13px]">
              {filteredWorkflows.length} workflow
              {filteredWorkflows.length !== 1 ? "s" : ""} found
            </p>
          )}
        </motion.div>
      </motion.div>

      {/* Error Warning */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4"
        >
          <div className="text-sm text-amber-800">
            Warning: {error}. Showing built-in workflows only.
          </div>
        </motion.div>
      )}

      {/* Info: Limited workflows available */}
      {!error && !loading && workflows.length === BUILT_IN_WORKFLOWS.length && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4"
        >
          <div className="text-sm text-blue-800">
            <strong>Note:</strong> Only showing built-in workflows. The backend
            may not have returned additional workflows. Check the browser
            console for details.
          </div>
        </motion.div>
      )}

      {/* Category Navigation Pills - Only show when not searching */}
      {!searchQuery.trim() && categories.length > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const categoryColor = getCategoryColorByName(category.name);

                return (
                  <button
                    key={category.id}
                    onClick={() => scrollToCategory(category.name)}
                    className="group flex items-center gap-2 rounded-md border-0 px-3 py-1.5 text-white transition-all duration-250 hover:opacity-90"
                    style={{
                      backgroundColor: categoryColor,
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    }}
                    aria-label={`Navigate to ${category.name} section`}
                  >
                    <span
                      className="flex h-3.5 w-3.5 items-center justify-center text-white"
                      style={{ strokeWidth: 1.5 }}
                    >
                      {getWorkflowIcon(category.icon_name)}
                    </span>
                    <span
                      className="text-[13px] text-white transition-colors duration-250"
                      style={{ letterSpacing: "-0.005em" }}
                    >
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Divider */}
          <div className="border-border mb-12 border-t" />
        </>
      )}

      {/* Workflow Display - Conditional: Flat grid when searching, Category sections when not */}
      {searchQuery.trim() ? (
        // Search Mode: Show flat grid of filtered workflows
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkflows.map((workflow, index) => {
            const categoryColor = getCategoryColorByName(
              workflow.category.name,
            );
            const illustrationSrc = getCategoryIllustration(
              workflow.category.name,
            );

            return (
              <motion.button
                key={workflow.workflow_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: [0.4, 0, 0.2, 1],
                }}
                whileHover={{ y: -1, transition: { duration: 0.2 } }}
                onClick={() => handleWorkflowClick(workflow.workflow_id)}
                className="group border-border relative w-full overflow-hidden rounded-lg border bg-white text-left transition-all duration-250 hover:border-transparent"
                style={{
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                  minHeight: "280px",
                }}
              >
                {/* Nature illustration background */}
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

                {/* Hover shadow enhancement */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-250 group-hover:opacity-100"
                  style={{
                    boxShadow: `0 12px 40px ${categoryColor}20`,
                  }}
                />

                {/* Content */}
                <div className="relative z-10 flex h-full flex-col px-7 pt-7 pb-8">
                  {/* Category badge */}
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

                  {/* Title */}
                  <h4
                    className="text-foreground group-hover:text-foreground mb-4 transition-colors duration-250"
                    style={{
                      letterSpacing: "-0.01em",
                      lineHeight: "1.4",
                      fontSize: "18px",
                      fontWeight: 500,
                      fontFamily:
                        "var(--font-source-serif-pro), Georgia, serif",
                    }}
                  >
                    {workflow.title}
                  </h4>

                  {/* Description */}
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
          })}
        </div>
      ) : (
        // Category Mode: Show grouped sections
        <div className="space-y-12">
          {Object.entries(workflowsByCategory).map(
            ([categoryName, categoryWorkflows], categoryIndex) => {
              const category = categoryWorkflows[0].category;
              const categoryColor = getCategoryColorByName(categoryName);
              const isOnboarding = categoryName === "Onboarding";
              const totalCategories =
                Object.entries(workflowsByCategory).length;
              const isLastCategory = categoryIndex === totalCategories - 1;
              // Find fallback workflow (order_index = 0) for this category
              const fallbackWorkflow = categoryWorkflows.find(
                (w) => w.order_index === 0,
              );

              return (
                <motion.section
                  key={categoryName}
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
                  {/* Category Header */}
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

                  {/* Workflows Grid */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categoryWorkflows.map((workflow, workflowIndex) => {
                      const illustrationSrc = getCategoryIllustration(
                        workflow.category.name,
                      );

                      return (
                        <motion.button
                          key={workflow.workflow_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: workflowIndex * 0.05,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                          whileHover={{ y: -1, transition: { duration: 0.2 } }}
                          onClick={() =>
                            handleWorkflowClick(workflow.workflow_id)
                          }
                          className="group border-border relative w-full overflow-hidden rounded-lg border bg-white text-left transition-all duration-250 hover:border-transparent"
                          style={{
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                            transitionTimingFunction:
                              "cubic-bezier(0.4, 0, 0.2, 1)",
                            minHeight: "280px",
                          }}
                        >
                          {/* Nature illustration background */}
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

                          {/* Hover shadow enhancement */}
                          <div
                            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-250 group-hover:opacity-100"
                            style={{
                              boxShadow: `0 12px 40px ${categoryColor}20`,
                            }}
                          />

                          {/* Content */}
                          <div className="relative z-10 flex h-full flex-col px-7 pt-7 pb-8">
                            {/* Category badge */}
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

                            {/* Title */}
                            <h4
                              className="text-foreground group-hover:text-foreground mb-4 transition-colors duration-250"
                              style={{
                                letterSpacing: "-0.01em",
                                lineHeight: "1.4",
                                fontSize: "18px",
                                fontWeight: 500,
                                fontFamily:
                                  "var(--font-source-serif-pro), Georgia, serif",
                              }}
                            >
                              {workflow.title}
                            </h4>

                            {/* Description */}
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
                    })}
                  </div>

                  {/* "My option isn't here" link - only show if fallback workflow exists */}
                  {fallbackWorkflow && (
                    <div className="mt-5 text-center">
                      <button
                        onClick={() => {
                          // Navigate to fallback workflow
                          navigationService.navigateToWorkflow(
                            fallbackWorkflow.workflow_id,
                          );
                        }}
                        className="text-muted-foreground decoration-muted-foreground/30 hover:text-foreground hover:decoration-foreground/50 text-[14px] underline decoration-1 underline-offset-4 transition-colors duration-250"
                        style={{
                          letterSpacing: "-0.003em",
                        }}
                      >
                        My option isn&apos;t here – discuss another{" "}
                        {categoryName.toLowerCase()} matter
                      </button>
                    </div>
                  )}
                </motion.section>
              );
            },
          )}
        </div>
      )}

      {/* No Results Message */}
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
            onClick={() => setSearchQuery("")}
            className="mt-4"
          >
            Clear search
          </Button>
        </motion.div>
      )}

      {/* Footer note */}
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
}
