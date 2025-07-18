"use client";

import React from "react";
import { Button } from "@/shared/components/ui/button";
import { LucideIcon } from "lucide-react";

interface NavigationButtonProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}) => {
  const handleClick = () => {
    console.log('NavigationButton clicked:', label);
    onClick();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`w-full justify-start ${
        isActive 
          ? "bg-slate-100 text-slate-900 font-medium" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
      onClick={handleClick}
    >
      <Icon className="mr-2 size-4" />
      {label}
    </Button>
  );
};