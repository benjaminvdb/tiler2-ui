import { PrimitiveRenderer } from "./primitive-renderer";
import { ArrayRenderer } from "./array-renderer";
import { ObjectRenderer } from "./object-renderer";

interface StateViewRecursiveProps {
  value: unknown;
  expanded?: boolean | undefined;
}
export const StateViewRecursive: React.FC<StateViewRecursiveProps> = ({
  value,
  expanded,
}) => {
  // Handle primitive types
  const primitiveResult = <PrimitiveRenderer value={value} />;
  if (primitiveResult) {
    return primitiveResult;
  }
  // Handle arrays
  if (Array.isArray(value)) {
    return (
      <ArrayRenderer
        value={value}
        expanded={expanded}
      />
    );
  }
  // Handle objects
  if (typeof value === "object" && value !== null) {
    return (
      <ObjectRenderer
        value={value as Record<string, unknown>}
        expanded={expanded}
      />
    );
  }
  return null;
};
