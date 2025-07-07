import { cn } from "@/lib/utils";
import { SyntaxHighlighter } from "@/components/thread/syntax-highlighter-lazy";
import { CodeHeader } from "../code-header";
import { CodeComponentProps } from "./markdown-elements";

export const code = ({ className, children, ...props }: CodeComponentProps) => {
  const match = /language-(\w+)/.exec(className || "");

  if (match) {
    const language = match[1];
    const code = String(children).replace(/\n$/, "");

    return (
      <>
        <CodeHeader
          language={language}
          code={code}
        />
        <SyntaxHighlighter
          language={language}
          {...(className && { className })}
        >
          {code}
        </SyntaxHighlighter>
      </>
    );
  }

  return (
    <code
      className={cn("rounded font-semibold", className)}
      {...props}
    >
      {children}
    </code>
  );
};
