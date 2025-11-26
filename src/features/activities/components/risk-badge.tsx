/**
 * Risk badge component for displaying risk levels.
 */

import * as React from "react";
import { Badge } from "@/shared/components/ui/badge";

/**
 * Risk level labels (1-5 scale).
 */
const RISK_LABELS: Record<number, string> = {
  1: "Low",
  2: "Low-medium",
  3: "Medium-high",
  4: "High",
  5: "Extremely high",
};

/**
 * Render a risk badge for risk columns.
 */
export const RiskBadge = ({ value }: { value: unknown }): React.JSX.Element => {
  const risk = Number(value);
  if (isNaN(risk) || risk < 1 || risk > 5) {
    return <span>{String(value)}</span>;
  }

  const riskVariant = `risk${risk}` as
    | "risk1"
    | "risk2"
    | "risk3"
    | "risk4"
    | "risk5";

  return (
    <Badge
      variant={riskVariant}
      className="w-full justify-center"
    >
      {RISK_LABELS[risk] ?? String(risk)}
    </Badge>
  );
};
