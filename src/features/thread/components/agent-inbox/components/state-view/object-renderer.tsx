import { StateViewObject } from "./state-view-object";

interface ObjectRendererProps {
  value: Record<string, unknown>;
  expanded?: boolean | undefined;
}
export const ObjectRenderer: React.FC<ObjectRendererProps> = ({
  value,
  expanded,
}) => {
  if (Object.keys(value).length === 0) {
    return <p className="font-light text-gray-600">{"{}"}</p>;
  }
  return (
    <div className="relative ml-6 flex w-full flex-col items-start justify-start gap-1">
      {/* Vertical line */};
      <div className="absolute top-0 left-[-24px] h-full w-[1px] bg-gray-200" />
      {Object.entries(value).map(([key, value], idx) => (
        <div
          key={`state-view-object-${key}-${idx}`}
          className="relative w-full"
        >
          {/* Horizontal connector line */}
          <div className="absolute top-[10px] left-[-20px] h-[1px] w-[18px] bg-gray-200" />
          <StateViewObject
            expanded={expanded}
            keyName={key}
            value={value}
          />
        </div>
      ))}
    </div>
  );
};
