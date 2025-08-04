"use client";

import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useRouter } from "next/navigation";
import { useUIContext } from "@/features/chat/providers/ui-provider";

/**
 * Global hotkeys provider that handles keyboard shortcuts throughout the app
 */
export const HotkeysProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { onNewThread } = useUIContext();

  // Detect platform for cross-platform shortcuts
  const isMac =
    typeof window !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  // New Chat shortcut: Ctrl+Alt+C (Windows/Linux) or Cmd+Opt+C (macOS)
  useHotkeys(
    isMac ? "meta+alt+c" : "ctrl+alt+c",
    (event) => {
      event.preventDefault();
      onNewThread();
    },
    {
      enableOnFormTags: true, // Allow shortcuts to work in form elements
      preventDefault: true,
    },
  );

  // Workflows shortcut: Ctrl+Alt+W (Windows/Linux) or Cmd+Opt+W (macOS)
  useHotkeys(
    isMac ? "meta+alt+w" : "ctrl+alt+w",
    (event) => {
      event.preventDefault();
      router.push("/workflows");
    },
    {
      enableOnFormTags: true, // Allow shortcuts to work in form elements
      preventDefault: true,
    },
  );

  return <>{children}</>;
};

/**
 * Get platform-specific shortcut display text
 */
export const getShortcutText = (shortcut: "new-chat" | "workflows"): string => {
  const isMac =
    typeof window !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  if (shortcut === "new-chat") {
    return isMac ? "⌘⌥C" : "Ctrl+Alt+C";
  } else if (shortcut === "workflows") {
    return isMac ? "⌘⌥W" : "Ctrl+Alt+W";
  }

  return "";
};
