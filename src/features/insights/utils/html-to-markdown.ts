import TurndownService from "turndown";
import { gfm } from "@truto/turndown-plugin-gfm";

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
