import React from "react";
import { CheckCircle, Edit3, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          className="h-8 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          onClick={onAccept}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Accept
        </Button>
      )}
      
      {config.allow_edit && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
          onClick={onEdit}
        >
          <Edit3 className="h-3 w-3 mr-1" />
          Edit
        </Button>
      )}
      
      {config.allow_ignore && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
          onClick={onIgnore}
        >
          <X className="h-3 w-3 mr-1" />
          Ignore
        </Button>
      )}
    </div>
  );
};