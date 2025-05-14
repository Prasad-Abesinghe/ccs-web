import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "~/lib/utils";

interface ComingSoonProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export function ComingSoon({
  title = "Coming Soon",
  description = "This feature is currently under development and will be available shortly.",
  className,
  ...props
}: ComingSoonProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-6 p-6 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Clock className="h-10 w-10" />
      </div>
      <div className="space-y-2 max-w-md mx-auto">
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
} 
