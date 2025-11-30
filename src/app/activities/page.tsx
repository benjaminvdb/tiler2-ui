/**
 * Activities page.
 *
 * Displays tenant-specific activity data in a server-side paginated
 * data table with sorting and filtering capabilities.
 */

"use client";

import { FileSpreadsheet } from "lucide-react";
import { ActivitiesDataTable, useActivities } from "@/features/activities";
import { Page } from "@/shared/components/ui/page";
import { PageContent } from "@/shared/components/ui/page-content";
import { PageHeader } from "@/shared/components/ui/page-header";

/**
 * Activities page component.
 *
 * Renders a full-width data table with all activity records
 * from the tenant's activities table.
 */
const ActivitiesPage = (): React.JSX.Element => {
  const { total } = useActivities({});

  return (
    <Page variant="fixed">
      <PageHeader
        sticky={false}
        title="Environmental Impact and Risk Assessment"
        subtitle="View and explore your organization's activities and environmental impact data"
        badge={{
          icon: FileSpreadsheet,
          label: `${total.toLocaleString()} records`,
          iconColor: "var(--forest-green)",
        }}
      />

      <PageContent variant="fixed">
        <ActivitiesDataTable />
      </PageContent>
    </Page>
  );
};

export default ActivitiesPage;
