import React from "react";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { MarkdownText } from "../markdown-text";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageSquare, Edit3, X } from "lucide-react";

interface ChatInterruptProps {
  interrupt: HumanInterrupt;
  onAccept?: () => void;
  onRespond?: () => void;
  onEdit?: () => void;
  onIgnore?: () => void;
}

export function ChatInterrupt({
  interrupt,
  onAccept,
  onRespond,
  onEdit,
  onIgnore,
}: ChatInterruptProps) {
  const { action_request, config, description } = interrupt;

  // Extract the question or description to display
  const questionText = description || `Review action: ${action_request.action}`;

  // Show arguments if available
  const hasArgs =
    action_request.args && Object.keys(action_request.args).length > 0;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
      {/* Question/Description */}
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

      {/* Show action details if available */}
      {/* {hasArgs && (
        <div className="ml-7 rounded border border-blue-200 bg-white/50 p-3">
          <div className="text-xs font-medium text-blue-700 mb-2">
            Action: {action_request.action}
          </div>
          <div className="text-xs text-blue-600">
            <pre className="whitespace-pre-wrap font-mono">
              {JSON.stringify(action_request.args, null, 2)}
            </pre>
          </div>
        </div>
      )} */}

      {/* Quick action buttons */}
      {/* <div className="ml-7 flex flex-wrap gap-2">
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
      </div> */}

      {/* Instruction text */}
      {/* <div className="ml-7 text-xs text-blue-600">
        {config.allow_edit ? (
          <>
            You can click <strong>Edit</strong> above, or simply type your response in the chat input below.
            {config.allow_edit && hasArgs && (
              <> For editing, provide the modified values in your response.</>
            )}
          </>
        ) : (
          "Type your response in the chat input below or use the buttons above."
        )}
      </div> */}
      {/* <div className="ml-7 text-xs text-blue-600">
        {"Type your response in the chat input below."}
      </div> */}
    </div>
  );
}
