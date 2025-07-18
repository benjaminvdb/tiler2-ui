"use client";

import React from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { LucideIcon } from "lucide-react";

interface NavigationButtonProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed?: boolean;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  icon: Icon,
  label,
  isActive,
  onClick,
  isCollapsed = false,
}) => {
  const handleClick = () => {
    console.log("NavigationButton clicked:", label);
    onClick();
  };

  const buttonContent = (
    <Button
      variant="ghost"
      size={isCollapsed ? "sm" : "sm"}
      className={`${
        isCollapsed ? "h-10 w-10 justify-center p-0" : "w-full justify-start"
      } ${
        isActive
          ? "bg-slate-100 font-medium text-slate-900"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
      onClick={handleClick}
    >
      <Icon className={isCollapsed ? "size-4" : "mr-2 size-4"} />
      {!isCollapsed && label}
    </Button>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttonContent;
};
