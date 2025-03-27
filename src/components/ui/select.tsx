import * as React from "react";
import * as Form from "@radix-ui/react-form";
import { cn } from "../../lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, id, ...props }, ref) => {
    return (
      <Form.Control asChild>
        <select
          id={id}
          className={cn(
            "flex h-9 w-full rounded-md border border-primary-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
      </Form.Control>
    );
  }
);
Select.displayName = "Select";

export { Select };
