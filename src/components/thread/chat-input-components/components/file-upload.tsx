import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { FileUploadProps } from "../types";

export function FileUpload({ onFileUpload }: FileUploadProps) {
  return (
    <>
      <Label
        htmlFor="file-input"
        className="flex cursor-pointer items-center gap-2"
      >
        <Plus className="size-5 text-gray-600" />
        <span className="text-sm text-gray-600">Upload PDF or Image</span>
      </Label>
      <input
        id="file-input"
        type="file"
        onChange={onFileUpload}
        multiple
        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
        className="hidden"
      />
    </>
  );
}
