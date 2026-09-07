import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado-300 focus-visible:ring-offset-2 focus-visible:ring-offset-blanco disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-borgona-600 text-blanco shadow-soft hover:bg-borgona-700 hover:shadow-card active:scale-[0.98]",
        secondary:
          "border border-borgona-300/70 bg-transparent text-borgona-700 hover:bg-borgona-50 active:scale-[0.98]",
        gold: "bg-dorado-300 text-borgona-800 hover:bg-dorado-400 shadow-soft active:scale-[0.98]",
        ghost: "text-borgona-700 hover:bg-borgona-50 active:scale-[0.98]",
        outline: "border border-ink/15 bg-transparent text-ink hover:bg-ink/5 active:scale-[0.98]",
        destructive: "bg-rubi-600 text-blanco hover:bg-rubi-700 active:scale-[0.98]",
        link: "text-borgona-700 underline underline-offset-4 hover:text-rubi-500",
      },
      size: {
        default: "h-12 px-7",
        sm: "h-10 px-5 text-[0.85rem]",
        lg: "h-14 px-9 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
