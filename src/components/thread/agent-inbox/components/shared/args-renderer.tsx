import { MarkdownText } from "../../../markdown-text";
import { prettifyText } from "../../utils";

interface ArgsRendererProps {
  args: Record<string, any>;
}

export function ArgsRenderer({ args }: ArgsRendererProps) {
  return (
    <div className="flex w-full flex-col items-start gap-6">
      {Object.entries(args).map(([k, v]) => {
        let value = "";
        if (["string", "number"].includes(typeof v)) {
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
}