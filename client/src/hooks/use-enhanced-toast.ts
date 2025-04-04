import * as React from "react";
import { useToast as useOriginalToast } from "@/hooks/use-toast";

type EnhancedToastVariant = "default" | "destructive" | "success" | "warning" | "info" | "error";

type EnhancedToastProps = {
  title?: string;
  description?: string;
  variant?: EnhancedToastVariant;
  duration?: number;
  hasCloseButton?: boolean;
  hasCopyButton?: boolean;
};

export function useEnhancedToast() {
  const { toast: originalToast, dismiss } = useOriginalToast();

  const showToast = React.useCallback(
    ({
      title,
      description,
      variant = "default",
      duration,
      hasCloseButton = true,
      hasCopyButton = false,
    }: EnhancedToastProps) => {
      // Using `as any` to bypass the type check since we're extending the original props
      return originalToast({
        title,
        description,
        variant: variant === "destructive" ? "destructive" : "default",
        duration,
        className: "enhanced-toast",
        // Pass additional props for our enhanced toast renderer
        custom: {
          hasCloseButton,
          hasCopyButton,
          variant,
        },
      } as any);
    },
    [originalToast]
  );

  const success = React.useCallback(
    (props: Omit<EnhancedToastProps, "variant">) =>
      showToast({ ...props, variant: "success" }),
    [showToast]
  );

  const error = React.useCallback(
    (props: Omit<EnhancedToastProps, "variant">) =>
      showToast({ ...props, variant: "error" }),
    [showToast]
  );

  const warning = React.useCallback(
    (props: Omit<EnhancedToastProps, "variant">) =>
      showToast({ ...props, variant: "warning" }),
    [showToast]
  );

  const info = React.useCallback(
    (props: Omit<EnhancedToastProps, "variant">) =>
      showToast({ ...props, variant: "info" }),
    [showToast]
  );

  return {
    toast: showToast,
    success,
    error,
    warning,
    info,
    dismiss,
  };
}