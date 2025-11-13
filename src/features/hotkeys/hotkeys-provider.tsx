import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useUIContext } from "@/features/chat/providers/ui-provider";

const HOTKEY_OPTIONS = {
  enableOnFormTags: true,
  preventDefault: true,
} as const;

const isMacPlatform = () =>
  typeof window !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const getShortcutBindings = () => {
  const isMac = isMacPlatform();
  return {
    newChat: isMac ? "meta+alt+c" : "ctrl+alt+c",
    workflows: isMac ? "meta+alt+w" : "ctrl+alt+w",
  };
};

export const HotkeysProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { navigationService, onNewThread } = useUIContext();
  const bindings = getShortcutBindings();

  useHotkeys(
    bindings.newChat,
    (event) => {
      event.preventDefault();
      onNewThread();
    },
    HOTKEY_OPTIONS,
  );

  useHotkeys(
    bindings.workflows,
    (event) => {
      event.preventDefault();
      navigationService.navigateToWorkflows();
    },
    HOTKEY_OPTIONS,
  );

  return <>{children}</>;
};

export const getShortcutText = (shortcut: "new-chat" | "workflows"): string => {
  const isMac = isMacPlatform();
  if (shortcut === "new-chat") {
    return isMac ? "⌘⌥C" : "Ctrl+Alt+C";
  }
  if (shortcut === "workflows") {
    return isMac ? "⌘⌥W" : "Ctrl+Alt+W";
  }
  return "";
};
