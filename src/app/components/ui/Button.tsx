import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-none focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "bg-[#884A4A] text-white hover:bg-[#884A4A] active:bg-[#884A4A] focus:bg-[#884A4A]",

        outline:
          "bg-transparent text-[#884A4A] hover:bg-transparent",

        ghost:
          "bg-transparent text-[#884A4A]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
      radius: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded",
        full: "rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "default", radius: "full" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, radius, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, radius }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
