/** Loading spinner and full-screen loading state components. */

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-4",
  lg: "h-12 w-12 border-4",
};

export const LoadingSpinner = ({
  size = "md",
  className = "",
}: LoadingSpinnerProps): React.JSX.Element => {
  const sizeClass = sizeClasses[size];

  return (
    <div
      className={`border-sage animate-spin rounded-full border-t-transparent ${sizeClass} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export const LoadingScreen = (): React.JSX.Element => (
  <div className="bg-background flex h-screen w-full items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);
