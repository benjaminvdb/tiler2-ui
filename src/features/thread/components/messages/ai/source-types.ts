export type SourceType =
  | "web"
  | "knowledge_base"
  | "methods_base"
  | "csrd_reports";

export interface Source {
  id: string;
  type: SourceType;
  title: string;
  url?: string;
  filename?: string;
  page_number?: number;
}
