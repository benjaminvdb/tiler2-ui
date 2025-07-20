"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/shared/components/layout";

// Workflow type constants matching backend
type WorkflowType = "data_summary" | "search_web" | "conversation";

interface WorkflowConfig {
  id: WorkflowType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function WorkflowsPage(): React.ReactNode {
  const router = useRouter();

  const workflows: WorkflowConfig[] = [
    {
      id: "data_summary",
      title: "Data Analysis Workflow",
      description:
        "Create a comprehensive summary to get an overview for the scope and scale of your data.",
      color: "blue",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
  ];

  const handleWorkflowClick = (workflowType: WorkflowType) => {
    // Navigate to chat with workflow type parameter
    router.push(`/?workflow=${workflowType}`);
  };

  return (
    <PageContainer>
      <h1 className="mb-4 text-3xl font-bold">Workflows</h1>
      <p className="mb-8 text-lg leading-relaxed text-gray-600">
        Workflows are predefined sequences of steps designed to accurately
        address sustainability objectives. In general, workflows have more
        controlled outcomes, are faster, and more accurate than an agent route.
        Especially for more complex tasks.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            onClick={() => handleWorkflowClick(workflow.id)}
            className="cursor-pointer rounded-lg border border-gray-200 p-6 transition-all duration-200 hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${workflow.color}-100`}
                >
                  <div className={`text-${workflow.color}-600`}>
                    {workflow.icon}
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
