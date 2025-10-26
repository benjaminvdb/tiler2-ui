import { Label } from "@/shared/components/ui/label";
import { Plus } from "lucide-react";
import { FileUploadProps } from "../types";

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  return (
    <>
      <Label
        htmlFor="file-input"
        className="hover:bg-sand/80 flex cursor-pointer items-center gap-2 rounded-md p-2 transition-colors"
      >
        <Plus className="text-muted-foreground size-5" />
        <span className="text-muted-foreground text-sm">Attach file</span>
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
};
