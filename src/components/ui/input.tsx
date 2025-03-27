import * as React from "react";
import * as Form from "@radix-ui/react-form";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, name, ...props }, ref) => {
    return (
      <Form.Control asChild>
        <input
          type={type}
          name={name}
          className={cn(
            "flex h-9 w-full rounded-md border border-primary-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </Form.Control>
    );
  }
);
Input.displayName = "Input";

export { Input };
