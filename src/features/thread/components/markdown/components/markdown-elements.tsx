import { ReactNode } from "react";
import { cn } from "@/shared/utils/utils";

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}
export interface CodeComponentProps extends BaseComponentProps {
  children?: ReactNode;
}
export const h1 = ({ className, ...props }: BaseComponentProps) => (
  <h1
    className={cn("my-6 first:mt-0 last:mb-0", className)}
    {...props}
  />
);

export const h2 = ({ className, ...props }: BaseComponentProps) => (
  <h2
    className={cn("my-6 first:mt-0 last:mb-0", className)}
    {...props}
  />
);

export const h3 = ({ className, ...props }: BaseComponentProps) => (
  <h3
    className={cn("my-5 first:mt-0 last:mb-0", className)}
    {...props}
  />
);

export const h4 = ({ className, ...props }: BaseComponentProps) => (
  <h4
    className={cn("my-4 first:mt-0 last:mb-0", className)}
    {...props}
  />
);

export const h5 = ({ className, ...props }: BaseComponentProps) => (
  <h5
    className={cn("my-4 first:mt-0 last:mb-0", className)}
    {...props}
  />
);

export const h6 = ({ className, ...props }: BaseComponentProps) => (
  <h6
    className={cn("my-4 first:mt-0 last:mb-0", className)}
    {...props}
  />
);

export const p = ({ className, ...props }: BaseComponentProps) => (
  <p
    className={cn("mt-5 mb-5 leading-7 first:mt-0 last:mb-0", className)}
    {...props}
  />
);

export const blockquote = ({ className, ...props }: BaseComponentProps) => (
  <blockquote
    className={cn("border-l-2 pl-6 italic", className)}
    {...props}
  />
);

export const ul = ({ className, ...props }: BaseComponentProps) => (
  <ul
    className={cn("my-5 ml-6 list-disc [&>li]:mt-2", className)}
    {...props}
  />
);

export const ol = ({ className, ...props }: BaseComponentProps) => (
  <ol
    className={cn("my-5 ml-6 list-decimal [&>li]:mt-2", className)}
    {...props}
  />
);

export const hr = ({ className, ...props }: BaseComponentProps) => (
  <hr
    className={cn("my-5 border-b", className)}
    {...props}
  />
);
