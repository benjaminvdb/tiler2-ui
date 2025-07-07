import React from "react";
import { CheckCircle, Edit3, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ActionButtonsProps } from "../types";

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  config,
  onAccept,
  onEdit,
  onIgnore,
}) => {
  return (
    <div className="ml-7 flex flex-wrap gap-2">
      {config.allow_accept && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-green-200 bg-green-50 text-xs text-green-700 hover:bg-green-100"
          onClick={onAccept}
        >
          <CheckCircle className="mr-1 h-3 w-3" />
          Accept
        </Button>
      )}
      {config.allow_edit && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-orange-200 bg-orange-50 text-xs text-orange-700 hover:bg-orange-100"
          onClick={onEdit}
        >
          <Edit3 className="mr-1 h-3 w-3" />
          Edit
        </Button>
      )}
      {config.allow_ignore && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-gray-200 bg-gray-50 text-xs text-gray-700 hover:bg-gray-100"
          onClick={onIgnore}
        >
          <X className="mr-1 h-3 w-3" />
          Ignore
        </Button>
      )}
    </div>
  );
};
