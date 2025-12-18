import { memo } from "react";
import type { ActivityMessage as ActivityMessageType } from "@copilotkit/shared";

interface ActivityMessageProps {
  message: ActivityMessageType;
}

const formatActivityContent = (
  content: ActivityMessageType["content"],
): string => {
  if (content === null || content === undefined) {
    return "";
  }
  if (typeof content === "string") {
    return content;
  }
  try {
    return JSON.stringify(content, null, 2);
  } catch {
    return String(content);
  }
};

export const ActivityMessage = memo(function ActivityMessage({
  message,
}: ActivityMessageProps) {
  const contentString = formatActivityContent(message.content);
  const activityLabel = message.activityType || "activity";

  if (!contentString.trim()) {
    return null;
  }

  return (
    <div className="mx-auto grid max-w-3xl grid-rows-[1fr_auto] gap-2">
      <div className="overflow-hidden rounded-lg border border-amber-200 bg-amber-50">
        <div className="border-b border-amber-200 bg-amber-100 px-4 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold tracking-wide text-amber-700 uppercase">
              Activity
            </span>
            <code className="rounded bg-amber-200/60 px-2 py-1 text-xs">
              {activityLabel}
            </code>
          </div>
        </div>
        <pre className="px-4 py-3 text-sm whitespace-pre-wrap text-amber-900">
          {contentString}
        </pre>
      </div>
    </div>
  );
});
