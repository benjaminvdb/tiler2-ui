export const haveArgsChanged = (
  args: unknown,
  initialValues: Record<string, string>,
): boolean => {
  if (typeof args !== "object" || !args) {
    return false;
  }

  const currentValues = args as Record<string, string>;

  return Object.entries(currentValues).some(([key, value]) => {
    const valueString = ["string", "number"].includes(typeof value)
      ? value.toString()
      : JSON.stringify(value, null);
    return initialValues[key] !== valueString;
  });
};
