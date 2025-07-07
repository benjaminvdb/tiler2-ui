"use client";

import { FC, Suspense } from "react";
import dynamic from "next/dynamic";

// Lazy load the MarkdownText component with a loading fallback
const MarkdownTextComponent = dynamic(
  () =>
    import("./markdown/index").then((mod) => ({ default: mod.MarkdownText })),
  {
    loading: () => (
      <div className="markdown-content p-4">
        <div className="animate-pulse">
          <div className="mb-3 h-6 w-3/4 rounded bg-gray-200"></div>
          <div className="mb-2 h-4 w-full rounded bg-gray-200"></div>
          <div className="mb-2 h-4 w-5/6 rounded bg-gray-200"></div>
          <div className="h-4 w-4/5 rounded bg-gray-200"></div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Loading markdown content...
        </p>
      </div>
    ),
    ssr: false, // Disable SSR for this component to reduce initial bundle
  },
);

interface MarkdownTextProps {
  children: string;
}
export const MarkdownText: FC<MarkdownTextProps> = (props) => {
  return (
    <Suspense
      fallback={
        <div className="markdown-content p-4">
          <div className="animate-pulse">
            <div className="mb-3 h-6 w-3/4 rounded bg-gray-200"></div>
            <div className="mb-2 h-4 w-full rounded bg-gray-200"></div>
            <div className="mb-2 h-4 w-5/6 rounded bg-gray-200"></div>
            <div className="h-4 w-4/5 rounded bg-gray-200"></div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Loading markdown content...
          </p>
        </div>
      }
    >
      <MarkdownTextComponent {...props} />
    </Suspense>
  );
};
