import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import * as Form from "@radix-ui/react-form";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  type?: "button" | "submit" | "reset";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Form.Submit asChild={type === "submit"}>
        <Comp
          type={type}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
            {
              "bg-primary-500 text-white shadow hover:bg-primary-600": variant === "default",
              "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90": variant === "destructive",
              "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground": variant === "outline",
              "bg-secondary-500 text-white shadow-sm hover:bg-secondary-600": variant === "secondary",
              "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
              "text-primary underline-offset-4 hover:underline": variant === "link",
              "h-9 px-4 py-2": size === "sm",
              "h-10 px-4 py-2": size === "default",
              "h-11 px-8": size === "lg",
              "h-9 w-9": size === "icon",
            },
            className
          )}
          ref={ref}
          {...props}
        />
      </Form.Submit>
    );
  }
);
Button.displayName = "Button";

export { Button };
