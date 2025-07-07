import { MarkdownText } from "../../../markdown-text-lazy";
import { prettifyText } from "../../utils";
import { JsonValue } from "@/shared/types";

interface ArgsRendererProps {
  args: Record<string, JsonValue>;
}
export const ArgsRenderer: React.FC<ArgsRendererProps> = ({ args }) => {
  return (
    <div className="flex w-full flex-col items-start gap-6">
      {Object.entries(args).map(([k, v]) => {
        let value = "";
        if (["string", "number"].includes(typeof v) && v !== null) {
          value = v.toString();
        } else {
          value = JSON.stringify(v, null);
        }
        return (
          <div
            key={`args-${k}`}
            className="flex flex-col items-start gap-1"
          >
            <p className="text-sm leading-[18px] text-wrap text-gray-600">
              {prettifyText(k)}:
            </p>
            <span className="w-full max-w-full rounded-xl bg-zinc-100 p-3 text-[13px] leading-[18px] text-black">
              <MarkdownText>{value}</MarkdownText>
            </span>
          </div>
        );
      })}
    </div>
  );
};
