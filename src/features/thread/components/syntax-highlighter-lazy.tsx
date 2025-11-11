"use client";

import { FC, Suspense, lazy } from "react";

// Lazy load the SyntaxHighlighter component with a loading fallback
const SyntaxHighlighterComponent = lazy(() =>
  import("./syntax-highlighter").then((mod) => ({
    default: mod.SyntaxHighlighter,
  })),
);

interface SyntaxHighlighterProps {
  children: string;
  language: string;
  className?: string;
}
export const SyntaxHighlighter: FC<SyntaxHighlighterProps> = (props) => {
  return (
    <Suspense
      fallback={
        <div className="rounded-lg bg-gray-900 p-6 text-gray-100">
          <div className="animate-pulse">
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-700"></div>
            <div className="mb-2 h-4 w-1/2 rounded bg-gray-700"></div>
            <div className="h-4 w-5/6 rounded bg-gray-700"></div>
          </div>
        </div>
      }
    >
      <SyntaxHighlighterComponent {...props} />
    </Suspense>
  );
};
