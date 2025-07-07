import { MarkdownText } from "../../../markdown-text-lazy";
import { unknownToPrettyDate } from "../../utils";

interface PrimitiveRendererProps {
  value: unknown;
}
export const PrimitiveRenderer: React.FC<PrimitiveRendererProps> = ({
  value,
}) => {
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
};
