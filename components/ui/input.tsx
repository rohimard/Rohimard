import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-xl border border-ink/15 bg-blanco px-4 text-[0.95rem] text-ink placeholder:text-ink/40 transition-colors focus-visible:outline-none focus-visible:border-borgona-400 focus-visible:ring-2 focus-visible:ring-borgona-100 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
