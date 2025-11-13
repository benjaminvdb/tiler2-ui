import {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  blockquote,
  ul,
  ol,
  hr,
} from "./markdown-elements";
import { table, tr, th, td } from "./table";
import { code } from "./code";
import { CitationLink } from "./citation-link";

export const defaultComponents = {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  a: CitationLink,
  blockquote,
  ul,
  ol,
  hr,
  table,
  tr,
  th,
  td,
  code,
};
