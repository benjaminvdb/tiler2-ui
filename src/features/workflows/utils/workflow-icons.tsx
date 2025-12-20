import React from "react";
import * as LucideIcons from "lucide-react";

const lucideIconLibrary = LucideIcons as unknown as Record<
  string,
  React.ComponentType<{ className?: string }>
>;

const toPascalCase = (value: string): string =>
  value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\s+/g, "");

/** Resolves a Lucide icon component by name, with a safe fallback. */
export const getWorkflowIcon = (iconName: string): React.ReactNode => {
  const iconComponentName = toPascalCase(iconName);
  const IconComponent =
    lucideIconLibrary[iconComponentName] ?? LucideIcons.HelpCircle;
  return <IconComponent className="h-5 w-5" />;
};
