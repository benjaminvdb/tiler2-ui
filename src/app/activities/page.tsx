/**
 * Activities page.
 *
 * Displays tenant-specific activity data in a server-side paginated
 * data table with sorting and filtering capabilities.
 */

import { Table2 } from "lucide-react";
import { ActivitiesDataTable } from "@/features/activities";

/**
 * Page header with title and description.
 */
const ActivitiesHeader = (): React.JSX.Element => (
  <div className="border-b border-[var(--border)] bg-[var(--card)] px-6 py-5">
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">Environmental Impact and Risk Assessment</h1>
          <p className="text-[var(--muted-foreground)]">
            View and explore your organization&apos;s activities and
            environmental impact data
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Table2
            className="h-4 w-4"
            style={{ color: "var(--forest-green)" }}
          />
          <span className="text-[var(--muted-foreground)]">
            Activity Records
          </span>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Activities page component.
 *
 * Renders a full-width data table with all activity records
 * from the tenant's activities table.
 */
const ActivitiesPage = (): React.JSX.Element => {
  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      <ActivitiesHeader />

      {/* Data Table Content */}
      <div className="min-h-0 flex-1 px-6 py-6">
        <div className="mx-auto h-full max-w-7xl">
          <ActivitiesDataTable />
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPage;
