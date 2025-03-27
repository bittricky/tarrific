import * as React from "react";
import * as Form from "@radix-ui/react-form";
import { cn } from "../../lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, htmlFor, ...props }, ref) => (
    <Form.Label
      ref={ref}
      className={cn(
        "text-sm font-medium text-primary-800 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      htmlFor={htmlFor}
      {...props}
    >
      {children}
    </Form.Label>
  )
);
Label.displayName = "Label";

export { Label };
