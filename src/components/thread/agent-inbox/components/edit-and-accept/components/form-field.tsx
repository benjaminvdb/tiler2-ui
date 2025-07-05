import { Textarea } from "@/components/ui/textarea";
import { prettifyText } from "../../../utils";
import {
  calculateDefaultRows,
  formatFieldValue,
} from "../utils/field-calculations";
import { FormFieldProps } from "../types";

export function FormField({
  fieldKey,
  value,
  editResponse,
  streaming,
  defaultRows,
  onEditChange,
  onKeyDown,
  index,
}: FormFieldProps) {
  const formattedValue = formatFieldValue(value);
  const numRows = calculateDefaultRows(value, fieldKey, defaultRows);

  return (
    <div
      className="flex h-full w-full flex-col items-start gap-1 px-[1px]"
      key={`allow-edit-args--${fieldKey}-${index}`}
    >
      <div className="flex w-full flex-col items-start gap-[6px]">
        <p className="min-w-fit text-sm font-medium">
          {prettifyText(fieldKey)}
        </p>
        <Textarea
          disabled={streaming}
          className="h-full"
          value={formattedValue}
          onChange={(e) => onEditChange(e.target.value, editResponse, fieldKey)}
          onKeyDown={onKeyDown}
          rows={numRows}
        />
      </div>
    </div>
  );
}
