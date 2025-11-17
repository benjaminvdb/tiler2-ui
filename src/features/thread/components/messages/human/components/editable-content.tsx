import { useCallback } from "react";
import { Textarea } from "@/shared/components/ui/textarea";
import { EditableContentProps } from "../types";

export const EditableContent: React.FC<EditableContentProps> = ({
  value,
  setValue,
  onSubmit,
}) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        onSubmit();
      }
    },
    [onSubmit],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
    },
    [setValue],
  );

  return (
    <Textarea
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className="focus-visible:ring-0"
    />
  );
};
