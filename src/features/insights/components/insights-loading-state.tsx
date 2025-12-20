import { Lightbulb } from "lucide-react";

export const InsightsLoadingState = (): React.JSX.Element => (
  <div className="flex h-full items-center justify-center bg-[var(--background)]">
    <div className="text-center">
      <Lightbulb className="mx-auto mb-2 h-8 w-8 animate-pulse text-[var(--muted-foreground)]" />
      <p className="text-[var(--muted-foreground)]">Loading insights...</p>
    </div>
  </div>
);
