import { Button } from "../ui/button";
import { Rocket, FileText, Search, Lightbulb } from "lucide-react";

interface ActionButtonsProps {
  onActionClick: (prompt: string) => void;
  isMobile?: boolean;
}

const actionItems = [
  {
    prompt: "Show me what you can do.",
    icon: Rocket,
    iconColor: "text-blue-400",
    label: "Get started",
  },
  {
    prompt: "Help me summarize some data.",
    icon: FileText,
    iconColor: "text-orange-400",
    label: "Summarize data",
  },
  {
    prompt: "What resources do you have access to?",
    icon: Search,
    iconColor: "text-purple-400",
    label: "Explore Resources",
  },
  {
    prompt: "Give me some ideas.",
    icon: Lightbulb,
    iconColor: "text-yellow-400",
    label: "Find Inspiration",
  },
];

export function ActionButtons({
  onActionClick,
  isMobile = false,
}: ActionButtonsProps) {
  const containerClassName = isMobile
    ? "mx-auto mb-4 grid w-full max-w-3xl grid-cols-2 gap-4 sm:hidden"
    : "mt-2 hidden items-center justify-center gap-4 pb-4 sm:flex";

  return (
    <div className={containerClassName}>
      {actionItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.prompt}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            onClick={() => onActionClick(item.prompt)}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-transparent">
              <Icon className={`h-3 w-3 ${item.iconColor}`} />
            </div>
            <span className="text-sm font-light">{item.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
