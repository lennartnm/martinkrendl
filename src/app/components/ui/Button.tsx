import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border shadow-sm",
  {
    variants: {
      variant: {
        // Default-Stil: bleibt auch bei Hover/Klick gleich
        default:
          "bg-[#2545F0] text-white border-[#2545F0] hover:bg-[#2545F0] hover:text-white active:bg-[#2545F0] active:text-white focus:text-white hover:shadow-none",

        // Outline bleibt transparent, aber ohne Farbänderung
        outline:
          "bg-transparent text-[#2545F0] border-[#2545F0] hover:bg-transparent hover:text-[#2545F0] hover:shadow-none",

        // Ghost minimal, aber ohne Farbänderung der Schrift
        ghost:
          "bg-transparent text-[#2545F0] hover:bg-slate-100 hover:text-[#2545F0]",
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
    // Standard bleibt default variant
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
