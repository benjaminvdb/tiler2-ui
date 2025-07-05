import { cn } from "@/lib/utils";
import { BaseComponentProps } from "./types";

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
