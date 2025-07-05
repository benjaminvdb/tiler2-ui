import { Textarea } from "@/components/ui/textarea";
import { EditableContentProps } from "../types";

export function EditableContent({
  value,
  setValue,
  onSubmit,
}: EditableContentProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <Textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      className="focus-visible:ring-0"
    />
  );
}