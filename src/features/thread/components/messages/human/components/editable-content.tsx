import React from "react";
import { Textarea } from "@/shared/components/ui/textarea";
import { EditableContentProps } from "../types";

export const EditableContent: React.FC<EditableContentProps> = ({
  value,
  setValue,
  onSubmit,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  return (
    <Textarea
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className="focus-visible:ring-0"
    />
  );
};
