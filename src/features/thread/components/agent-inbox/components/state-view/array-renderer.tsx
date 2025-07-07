import { isArrayOfMessages, baseMessageObject } from "../../utils";
import { MessagesRenderer } from "./messages-renderer";
import { StateViewRecursive } from "./state-view-recursive";

interface ArrayRendererProps {
  value: unknown[];
  expanded?: boolean | undefined;
}
export const ArrayRenderer: React.FC<ArrayRendererProps> = ({
  value,
  expanded,
}) => {
  if (value.length > 0 && isArrayOfMessages(value as Record<string, any>[])) {
    return <MessagesRenderer messages={value as any} />;
  }
  return (
    <div className="flex w-full flex-row items-start justify-start gap-1">
      <span className="font-normal text-black">[</span>
      {value.map((item, idx) => {
        const itemRenderValue = baseMessageObject(item);
        return (
          <div
            key={`state-view-${idx}`}
            className="flex w-full flex-row items-start whitespace-pre-wrap"
          >
            <StateViewRecursive
              value={itemRenderValue}
              expanded={expanded}
            />
            {idx < value?.length - 1 && (
              <span className="font-normal text-black">,&nbsp</span>
            )}
          </div>
        );
      })}
      ;<span className="font-normal text-black">]</span>
    </div>
  );
};
