import { TextContentProps } from "../types";

export const TextContent: React.FC<TextContentProps> = ({ contentString }) => {
  if (!contentString) {
    return null;
  }
  return (
    <div
      className="ml-auto max-w-[75%] rounded-lg px-5 py-3"
      style={{
        backgroundColor: "#D4CEC5",
        color: "#2A251F",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
      }}
    >
      <p className="text-sm whitespace-pre-wrap">{contentString}</p>
    </div>
  );
};
