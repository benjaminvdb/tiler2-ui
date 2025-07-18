import React from "react";
import { cn } from "@/shared/utils/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  full: "max-w-none",
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  maxWidth = "3xl",
  padding = "lg",
}) => {
  return (
    <div className="flex h-full w-full flex-col">
      <div
        className={cn(
          "mx-auto w-full flex-1",
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
};
