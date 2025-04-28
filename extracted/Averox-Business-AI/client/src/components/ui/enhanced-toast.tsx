import * as React from "react";
import { X, Copy, Check, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Toast, 
  ToastProps, 
  ToastClose,
  ToastDescription,
  ToastTitle
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

interface EnhancedToastProps extends React.ComponentPropsWithoutRef<typeof Toast> {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning" | "info" | "error";
  hasCloseButton?: boolean;
  hasCopyButton?: boolean;
}

export function EnhancedToast({
  className,
  title,
  description,
  variant = "default",
  hasCloseButton = true,
  hasCopyButton = false,
  ...props
}: EnhancedToastProps) {
  const { dismiss } = useToast();
  const [copied, setCopied] = React.useState(false);

  // Get the appropriate icon based on variant
  const getIcon = () => {
    switch (variant) {
      case "success":
        return <Check className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  // Handle copy content
  const handleCopyContent = () => {
    if (description) {
      navigator.clipboard.writeText(description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get the background color based on variant
  const getBackgroundColor = () => {
    switch (variant) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
      case "destructive":
        return "bg-red-50 border-red-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "";
    }
  };

  return (
    <Toast
      className={cn(
        "enhanced-toast group relative flex w-full items-center justify-between space-x-4 overflow-hidden border p-4",
        getBackgroundColor(),
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="grid gap-1">
          {title && <ToastTitle>{title}</ToastTitle>}
          {description && (
            <ToastDescription>{description}</ToastDescription>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {hasCopyButton && (
          <button
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            onClick={handleCopyContent}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        )}
        {hasCloseButton && (
          <ToastClose className="opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
          </ToastClose>
        )}
      </div>
    </Toast>
  );
}