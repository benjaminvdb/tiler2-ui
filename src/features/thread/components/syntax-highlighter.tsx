import { PrismAsyncLight as SyntaxHighlighterPrism } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { FC } from "react";

// PrismAsyncLight automatically loads languages on-demand
// No need to manually register languages - it will dynamically import them when needed

interface SyntaxHighlighterProps {
  children: string;
  language: string;
  className?: string;
}
export const SyntaxHighlighter: FC<SyntaxHighlighterProps> = ({
  children,
  language,
  className,
}) => {
  return (
    <SyntaxHighlighterPrism
      language={language}
      style={coldarkDark}
      customStyle={{
        margin: 0,
        width: "100%",
        background: "transparent",
        padding: "1.5rem 1rem",
      }}
      className={className}
    >
      {children}
    </SyntaxHighlighterPrism>
  );
};
