import { ReactNode } from "react";

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface CodeComponentProps extends BaseComponentProps {
  children?: ReactNode;
}
