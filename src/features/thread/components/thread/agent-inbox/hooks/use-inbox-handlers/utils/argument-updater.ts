/**
 * Updates arguments based on change and key parameters
 */
export function updateArguments(
  originalArgs: Record<string, any>,
  change: string | string[],
  key: string | string[],
): Record<string, any> {
  const updatedArgs = { ...originalArgs };

  if (Array.isArray(change) && Array.isArray(key)) {
    // Handle array inputs by mapping corresponding values
    change.forEach((value, index) => {
      if (index < key.length) {
        updatedArgs[key[index]] = value;
      }
    });
  } else {
    // Handle single value case
    updatedArgs[key as string] = change as string;
  }

  return updatedArgs;
}

/**
 * Validates that change and key parameters have compatible types
 */
export function validateChangeKeyTypes(
  change: string | string[],
  key: string | string[],
): boolean {
  return !(
    (Array.isArray(change) && !Array.isArray(key)) ||
    (!Array.isArray(change) && Array.isArray(key))
  );
}
