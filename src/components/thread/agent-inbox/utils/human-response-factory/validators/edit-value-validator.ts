export function validateAndUpdateEditValue(
  key: string,
  value: unknown,
  initialHumanInterruptEditValue: React.MutableRefObject<Record<string, string>>
): void {
  let stringValue = "";
  if (typeof value === "string") {
    stringValue = value;
  } else {
    stringValue = JSON.stringify(value, null);
  }

  if (
    !initialHumanInterruptEditValue.current ||
    !(key in initialHumanInterruptEditValue.current)
  ) {
    initialHumanInterruptEditValue.current = {
      ...initialHumanInterruptEditValue.current,
      [key]: stringValue,
    };
  } else if (
    key in initialHumanInterruptEditValue.current &&
    initialHumanInterruptEditValue.current[key] !== stringValue
  ) {
    console.error(
      "KEY AND VALUE FOUND IN initialHumanInterruptEditValue.current THAT DOES NOT MATCH THE ACTION REQUEST",
      {
        key: key,
        value: stringValue,
        expectedValue: initialHumanInterruptEditValue.current[key],
      },
    );
  }
}