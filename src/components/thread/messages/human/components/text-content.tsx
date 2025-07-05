import { TextContentProps } from "../types";

export function TextContent({ contentString }: TextContentProps) {
  if (!contentString) {
    return null;
  }

  return (
    <p className="bg-muted ml-auto w-fit rounded-3xl px-4 py-2 text-right whitespace-pre-wrap">
      {contentString}
    </p>
  );
}
