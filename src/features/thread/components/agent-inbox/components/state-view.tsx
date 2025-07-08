import { useState } from "react";
import { cn } from "@/shared/utils/utils";
import { MarkdownText } from "../../markdown-text";
import { StateViewObject } from "./state-view/state-view-object";
import { StateViewControls } from "./state-view/state-view-controls";

interface StateViewComponentProps {
  values: Record<string, unknown>;
  description: string | undefined;
  handleShowSidePanel: (showState: boolean, showDescription: boolean) => void;
  view: "description" | "state";
}
export const StateView: React.FC<StateViewComponentProps> = ({
  handleShowSidePanel,
  view,
  values,
  description,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!values) {
    return <div>No state found</div>;
  }
  return (
    <div
      className={cn(
        "flex w-full flex-row gap-0",
        view === "state" &&
          "border-t-[1px] border-gray-100 lg:border-t-[0px] lg:border-l-[1px]",
      )}
    >
      {view === "description" && (
        <div className="pt-6 pb-2">
          <MarkdownText>
            {description ?? "No description provided"}
          </MarkdownText>
        </div>
      )}
      {view === "state" && (
        <div className="flex flex-col items-start justify-start gap-1">
          {Object.entries(values).map(([k, v], idx) => (
            <StateViewObject
              expanded={expanded}
              key={`state-view-${k}-${idx}`}
              keyName={k}
              value={v}
            />
          ))}
        </div>
      )}
      <StateViewControls
        expanded={expanded}
        onToggleExpanded={() => setExpanded((prev) => !prev)}
        onClose={() => handleShowSidePanel(false, false)}
        showExpandToggle={view === "state"}
      />
    </div>
  );
};
