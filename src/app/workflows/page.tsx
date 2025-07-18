"use client";

import React from "react";
import { SidePanel } from "@/features/side-panel";
import { ErrorBoundary } from "@/shared/components/error-boundary";
import { AppProviders } from "../app-providers";

function WorkflowsContent(): React.ReactNode {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <SidePanel />
      <div className="h-screen flex-1 p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-3xl font-bold">Workflows</h1>
          <p className="mb-8 text-lg leading-relaxed text-gray-600">
            Workflows are predefined sequences of steps designed to accurately
            address sustainability objectives. In general, workflows have more
            controlled outcomes, are faster, and more accurate than an agent
            route. Especially for more complex tasks.
          </p>

          <div className="grid grid-cols-2 gap-6">
            {/* Workflow Card 1 */}
            <div className="cursor-pointer rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <svg
                      className="h-6 w-6 text-blue-600"
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
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold">
                    Data Analysis Workflow
                  </h3>
                  <p className="text-sm text-gray-600">
                    Automatically analyze sustainability data and generate
                    comprehensive reports with key insights and recommendations.
                  </p>
                </div>
              </div>
            </div>

            {/* Workflow Card 2 */}
            <div className="cursor-pointer rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold">
                    Carbon Footprint Assessment
                  </h3>
                  <p className="text-sm text-gray-600">
                    Calculate and track carbon emissions across your
                    organization with detailed breakdowns and reduction
                    strategies.
                  </p>
                </div>
              </div>
            </div>

            {/* Workflow Card 3 */}
            <div className="cursor-pointer rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold">
                    Compliance Monitoring
                  </h3>
                  <p className="text-sm text-gray-600">
                    Monitor regulatory compliance across multiple frameworks and
                    generate automated compliance reports.
                  </p>
                </div>
              </div>
            </div>

            {/* Workflow Card 4 */}
            <div className="cursor-pointer rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                    <svg
                      className="h-6 w-6 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold">
                    Energy Optimization
                  </h3>
                  <p className="text-sm text-gray-600">
                    Analyze energy consumption patterns and identify
                    opportunities for efficiency improvements and cost savings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowsPage(): React.ReactNode {
  return (
    <ErrorBoundary>
      <React.Suspense
        fallback={
          <div className="bg-background flex h-screen w-full items-center justify-center">
            <div className="text-center">
              <div className="border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            </div>
          </div>
        }
      >
        <AppProviders>
          <WorkflowsContent />
        </AppProviders>
      </React.Suspense>
    </ErrorBoundary>
  );
}
