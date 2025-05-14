import * as React from "react";
import { ShieldAlert } from "lucide-react";
import { cn } from "~/lib/utils";

interface UnauthorizedProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export function Unauthorized({
  title = "Access Denied",
  description = "You don't have permission to access this page. Please contact your administrator if you believe this is an error.",
  className,
  ...props
}: UnauthorizedProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-6 p-6 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <div className="space-y-2 max-w-md mx-auto">
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
} 
