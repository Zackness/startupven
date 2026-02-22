"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input as UIInput } from "@/components/ui/input";

export interface InputProps extends React.ComponentProps<typeof UIInput> {
  label?: string;
  disable?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, disable, id, ...props }, ref) => {
    const inputId = id ?? React.useId();
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none text-[var(--foreground)]"
          >
            {label}
          </label>
        )}
        <UIInput
          id={inputId}
          ref={ref}
          disabled={disable}
          className={cn(className)}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;
