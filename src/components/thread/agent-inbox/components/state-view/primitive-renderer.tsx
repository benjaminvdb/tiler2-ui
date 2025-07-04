import { MarkdownText } from "../../../markdown-text";
import { unknownToPrettyDate } from "../../utils";

interface PrimitiveRendererProps {
  value: unknown;
}

export function PrimitiveRenderer({ value }: PrimitiveRendererProps) {
  const date = unknownToPrettyDate(value);
  if (date) {
    return <p className="font-light text-gray-600">{date}</p>;
  }

  if (["string", "number"].includes(typeof value)) {
    return <MarkdownText>{value as string}</MarkdownText>;
  }

  if (typeof value === "boolean") {
    return <MarkdownText>{JSON.stringify(value)}</MarkdownText>;
  }

  if (value == null) {
    return <p className="font-light whitespace-pre-wrap text-gray-600">null</p>;
  }

  return null;
}