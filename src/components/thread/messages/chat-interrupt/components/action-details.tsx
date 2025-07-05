import React from "react";
import { ActionDetailsProps } from "../types";

export const ActionDetails: React.FC<ActionDetailsProps> = ({
  actionRequest,
  hasArgs,
}) => {
  if (!hasArgs) return null;

  return (
    <div className="ml-7 rounded border border-blue-200 bg-white/50 p-3">
      <div className="text-xs font-medium text-blue-700 mb-2">
        Action: {actionRequest.action}
      </div>
      <div className="text-xs text-blue-600">
        <pre className="whitespace-pre-wrap font-mono">
          {JSON.stringify(actionRequest.args, null, 2)}
        </pre>
      </div>
    </div>
  );
};