import React from "react";
import { MessageSquare } from "lucide-react";
import { MarkdownText } from "../../../markdown-text-lazy";
import { InterruptHeaderProps } from "../types";

export const InterruptHeader: React.FC<InterruptHeaderProps> = ({
  questionText,
}) => {
  return (
    <div className="flex items-start gap-2">
      <MessageSquare className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
      <div className="flex-1">
        <div className="mb-1 text-sm font-medium text-blue-900">
          Assistant Question
        </div>
        <div className="text-sm text-blue-800">
          <MarkdownText>{questionText}</MarkdownText>
        </div>
      </div>
    </div>
  );
};
