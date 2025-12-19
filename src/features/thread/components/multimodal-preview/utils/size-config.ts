export const getImageSizeConfig = (
  size: "sm" | "md" | "lg",
): { className: string; width: number; height: number } => {
  switch (size) {
    case "sm":
      return {
        className: "rounded-md object-cover h-10 w-10 text-base",
        width: 16,
        height: 16,
      };
    case "lg":
      return {
        className: "rounded-md object-cover h-24 w-24 text-xl",
        width: 48,
        height: 48,
      };
    case "md":
    default:
      return {
        className: "rounded-md object-cover h-16 w-16 text-lg",
        width: 32,
        height: 32,
      };
  }
};

export const getIconSize = (size: "sm" | "md" | "lg"): string => {
  return size === "sm" ? "h-5 w-5" : "h-7 w-7";
};
