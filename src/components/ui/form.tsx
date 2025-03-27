import * as React from "react";
import * as FormPrimitive from "@radix-ui/react-form";
import { cn } from "../../lib/utils";

const Form = FormPrimitive.Root;
const FormField = FormPrimitive.Field;
const FormLabel = FormPrimitive.Label;
const FormControl = FormPrimitive.Control;
const FormMessage = FormPrimitive.Message;
const FormSubmit = FormPrimitive.Submit;

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-primary-500 mt-1", className)}
    {...props}
  />
));
FormDescription.displayName = "FormDescription";

export {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormSubmit,
  FormDescription,
};
