"use client";

import React, { useEffect, useState } from "react";
import { PageContainer } from "@/shared/components/layout";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { getClientConfig } from "@/core/config/client";
import { LoadingScreen } from "@/shared/components/loading-spinner";
import * as LucideIcons from "lucide-react";

interface WorkflowConfig {
  id: number;
  workflow_id: string;
  title: string;
  description: string;
  icon: string;
  icon_color: string;
  order_index: number;
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
  const IconComponent = (LucideIcons as any)[iconComponentName] as
    | React.ComponentType<{ className?: string }>
    | undefined;

  if (IconComponent) {
    return <IconComponent className="h-6 w-6" />;
  }

  // Fallback to HelpCircle if icon not found
  return <LucideIcons.HelpCircle className="h-6 w-6" />;
};

// Hard-coded built-in workflows that are always available
const BUILT_IN_WORKFLOWS: WorkflowConfig[] = [
  {
    id: 1,
    workflow_id: "data_summary",
    title: "Data Analysis Workflow",
    description:
      "Create a comprehensive summary to get an overview for the scope and scale of your data.",
    icon: "clipboard-list",
    icon_color: "blue",
    order_index: 0,
  },
];

export default function WorkflowsPage(): React.ReactNode {
  const { navigationService } = useUIContext();
  const [workflows, setWorkflows] =
    useState<WorkflowConfig[]>(BUILT_IN_WORKFLOWS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dynamic workflows from backend API and combine with built-in ones
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true);

        // Get backend URL from config
        const { apiUrl } = getClientConfig();

        // Get fresh auth token from server-side endpoint
        const tokenResponse = await fetch("/api/auth/token");
        if (!tokenResponse.ok) {
          throw new Error("Failed to get access token");
        }
        const { token } = await tokenResponse.json();

        // Call backend API directly with Authorization header
        const response = await fetch(`${apiUrl}/workflows`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const dynamicWorkflows: WorkflowConfig[] = await response.json();

          // Combine built-in workflows with dynamic ones
          // Filter out any duplicates based on workflow_id
          const existingIds = new Set(
            BUILT_IN_WORKFLOWS.map((w) => w.workflow_id),
          );
          const uniqueDynamicWorkflows = dynamicWorkflows.filter(
            (w) => !existingIds.has(w.workflow_id),
          );

          // Combine and sort by order_index
          const combinedWorkflows = [
            ...BUILT_IN_WORKFLOWS,
            ...uniqueDynamicWorkflows,
          ].sort((a, b) => a.order_index - b.order_index);

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
  }, []);

  const handleWorkflowClick = (workflowId: string) => {
    navigationService.navigateToWorkflow(workflowId);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <PageContainer>
      <h1 className="mb-4 text-3xl font-bold">Workflows</h1>
      <p className="mb-8 text-lg leading-relaxed text-gray-600">
        Workflows are predefined sequences of steps designed to accurately
        address sustainability objectives. In general, workflows have more
        controlled outcomes, are faster, and more accurate than an agent route.
        Especially for more complex tasks.
      </p>

      {error && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="text-sm text-yellow-800">
            Warning: {error}. Showing built-in workflows only.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {workflows.map((workflow) => (
          <div
            key={workflow.workflow_id}
            onClick={() => handleWorkflowClick(workflow.workflow_id)}
            className="cursor-pointer rounded-lg border border-gray-200 p-6 transition-all duration-200 hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${workflow.icon_color}-100`}
                >
                  <div className={`text-${workflow.icon_color}-600`}>
                    {getWorkflowIcon(workflow.icon)}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-semibold">{workflow.title}</h3>
                <p className="text-sm text-gray-600">{workflow.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
