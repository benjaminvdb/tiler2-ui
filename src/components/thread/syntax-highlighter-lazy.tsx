"use client";

import { FC, Suspense } from "react";
import dynamic from "next/dynamic";

// Lazy load the SyntaxHighlighter component with a loading fallback
const SyntaxHighlighterComponent = dynamic(
  () =>
    import("./syntax-highlighter").then((mod) => ({
      default: mod.SyntaxHighlighter,
    })),
  {
    loading: () => (
      <div className="rounded-lg bg-gray-900 p-6 text-gray-100">
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-700"></div>
          <div className="mb-2 h-4 w-1/2 rounded bg-gray-700"></div>
          <div className="h-4 w-5/6 rounded bg-gray-700"></div>
        </div>
        <p className="mt-2 text-sm text-gray-400">
          Loading syntax highlighter...
        </p>
      </div>
    ),
    ssr: false, // Disable SSR for this component to reduce initial bundle
  },
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
          <p className="mt-2 text-sm text-gray-400">
            Loading syntax highlighter...
          </p>
        </div>
      }
    >
      <SyntaxHighlighterComponent {...props} />
    </Suspense>
  );
};
