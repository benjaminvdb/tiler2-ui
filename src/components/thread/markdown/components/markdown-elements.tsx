import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface CodeComponentProps extends BaseComponentProps {
  children?: ReactNode;
}

// Headings
export const h1 = ({ className, ...props }: BaseComponentProps) => (
  <h1
    className={cn("my-6 text-3xl font-bold first:mt-0 last:mb-0", className)}
    {...props}
  />
);

export const h2 = ({ className, ...props }: BaseComponentProps) => (
  <h2
    className={cn("my-6 text-2xl font-bold first:mt-0 last:mb-0", className)}
    {...props}
  />
);

export const h3 = ({ className, ...props }: BaseComponentProps) => (
  <h3
    className={cn("my-5 text-xl font-semibold first:mt-0 last:mb-0", className)}
    {...props}
  />
);

export const h4 = ({ className, ...props }: BaseComponentProps) => (
  <h4
    className={cn("my-4 text-lg font-semibold first:mt-0 last:mb-0", className)}
    {...props}
  />
);

export const h5 = ({ className, ...props }: BaseComponentProps) => (
  <h5
    className={cn("my-4 text-lg font-semibold first:mt-0 last:mb-0", className)}
    {...props}
  />
);

export const h6 = ({ className, ...props }: BaseComponentProps) => (
  <h6
    className={cn("my-4 font-semibold first:mt-0 last:mb-0", className)}
    {...props}
  />
);

// Text Elements
export const p = ({ className, ...props }: BaseComponentProps) => (
  <p
    className={cn("mt-5 mb-5 leading-7 first:mt-0 last:mb-0", className)}
    {...props}
  />
);

export const a = ({ className, ...props }: BaseComponentProps) => (
  <a
    className={cn(
      "text-primary font-medium underline underline-offset-4",
      className,
    )}
    {...props}
  />
);

export const blockquote = ({ className, ...props }: BaseComponentProps) => (
  <blockquote
    className={cn("border-l-2 pl-6 italic", className)}
    {...props}
  />
);

// Lists
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

// Layout
export const hr = ({ className, ...props }: BaseComponentProps) => (
  <hr
    className={cn("my-5 border-b", className)}
    {...props}
  />
);
