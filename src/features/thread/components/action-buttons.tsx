import { Button } from "@/shared/components/ui/button";
import { Rocket, BarChart3, BookOpen, Puzzle } from "lucide-react";

interface ActionButtonsProps {
  onActionClick: (prompt: string) => void;
  isMobile?: boolean;
}
const actionItems = [
  {
    prompt: "What can you do for me?",
    icon: Rocket,
    iconColor: "text-blue-400",
    label: "Getting started",
  },
  {
    prompt: "What resources do you have access to?",
    icon: BookOpen,
    iconColor: "text-purple-400",
    label: "Explore resources",
  },
  {
    prompt: "What data does the system contain and how can I use it to generate insights?",
    icon: BarChart3,
    iconColor: "text-orange-400",
    label: "Analyze data",
  },
  {
    prompt: "Quiz me on my knowledge about corporate sustainability. No questions that require long or multiple answers. Go for it straight away.",
    icon: Puzzle,
    iconColor: "text-yellow-400",
    label: "Quiz me",
  },
];

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onActionClick,
  isMobile = false,
}) => {
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
};
