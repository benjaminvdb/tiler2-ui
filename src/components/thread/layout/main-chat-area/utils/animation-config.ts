export function getAnimationConfig(
  chatHistoryOpen: boolean,
  isLargeScreen: boolean
) {
  return {
    marginLeft: chatHistoryOpen ? (isLargeScreen ? 300 : 0) : 0,
    width: chatHistoryOpen
      ? isLargeScreen
        ? "calc(100% - 300px)"
        : "100%"
      : "100%",
  };
}

export function getTransitionConfig(isLargeScreen: boolean) {
  return isLargeScreen
    ? { type: "spring" as const, stiffness: 300, damping: 30 }
    : { duration: 0 };
}