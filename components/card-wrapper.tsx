import * as React from "react";
import { cn } from "@/lib/utils";

interface CardWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  headerLabel?: string;
  children: React.ReactNode;
}

export const CardWrapper = ({ headerLabel, children, className, ...props }: CardWrapperProps) => {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg",
        className
      )}
      {...props}
    >
      {headerLabel && (
        <h1 className="text-2xl font-semibold text-center text-black mb-6">
          {headerLabel}
        </h1>
      )}
      {children}
    </div>
  );
};
