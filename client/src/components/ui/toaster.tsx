import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { EnhancedToast } from "@/components/ui/enhanced-toast"

// Extend the toast type to include our custom properties
type ExtendedToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  custom?: {
    hasCloseButton?: boolean;
    hasCopyButton?: boolean;
    variant?: "default" | "destructive" | "success" | "warning" | "info" | "error";
  };
  [key: string]: any;
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }: ExtendedToast) {
        // Check if this toast should use the enhanced component
        const isEnhanced = props.className?.includes('enhanced-toast') || props.custom?.variant;
        
        if (isEnhanced && props.custom) {
          // Convert title and description to string if they are React nodes
          const titleStr = typeof title === 'string' ? title as string : undefined;
          const descStr = typeof description === 'string' ? description as string : undefined;
          
          // Render enhanced toast
          return (
            <EnhancedToast
              key={id}
              title={titleStr}
              description={descStr}
              variant={props.custom.variant as "default" | "destructive" | "success" | "warning" | "info" | "error"}
              hasCloseButton={props.custom.hasCloseButton}
              hasCopyButton={props.custom.hasCopyButton}
              {...props}
            />
          )
        }
        
        // Default toast rendering
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}