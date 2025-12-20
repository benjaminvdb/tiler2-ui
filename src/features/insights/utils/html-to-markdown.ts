/** HTML to Markdown conversion utilities for saving text selections with formatting preserved. */

import TurndownService from "turndown";
import { gfm } from "@truto/turndown-plugin-gfm";

/**
 * Creates a Turndown converter configured for GitHub-flavored markdown.
 * Preserves formatting like bold, italics, lists, code blocks, and tables.
 */
export const createMarkdownConverter = (): TurndownService => {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    emDelimiter: "_",
    strongDelimiter: "**",
  });

  turndownService.use(gfm);

  return turndownService;
};

/**
 * Converts a browser Selection object to markdown text.
 * Extracts the selection's HTML content and converts it to markdown format.
 */
export const selectionToMarkdown = (selection: Selection | null): string => {
  if (!selection || selection.rangeCount === 0) {
    return "";
  }

  const range = selection.getRangeAt(0);
  const container = document.createElement("div");
  container.appendChild(range.cloneContents());

  const converter = createMarkdownConverter();
  return converter.turndown(container.innerHTML);
};
