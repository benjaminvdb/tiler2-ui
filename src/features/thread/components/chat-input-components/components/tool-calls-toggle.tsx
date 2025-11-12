import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { ToolCallsToggleProps } from "../types";

export const ToolCallsToggle: React.FC<ToolCallsToggleProps> = ({
  hideToolCalls,
  onHideToolCallsChange,
}) => {
  if (import.meta.env.VITE_HIDE_TOOL_CALLS !== "false") return null;

  return (
    <div>
      <div className="flex items-center space-x-2">
        <Switch
          id="render-tool-calls"
          checked={hideToolCalls ?? true}
          onCheckedChange={onHideToolCallsChange}
        />
        <Label
          htmlFor="render-tool-calls"
          className="text-sm text-gray-600"
        >
          Hide Tool Calls
        </Label>
      </div>
    </div>
  );
};
