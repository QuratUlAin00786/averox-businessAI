import React from 'react';
import { cn } from "@/lib/utils";
import { Link } from 'wouter';

export interface DashboardButtonProps {
  children: React.ReactNode;
  actionText?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  [key: string]: any;
}

export function DashboardButton({ 
  children, 
  actionText,
  onClick, 
  href,
  className,
  variant = 'default',
  size = 'default',
  ...props 
}: DashboardButtonProps) {
  
  // Base button classes
  const baseClasses = cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    // Size variations
    size === 'default' && "h-10 px-4 py-2",
    size === 'sm' && "h-9 rounded-md px-3",
    size === 'lg' && "h-11 rounded-md px-8",
    size === 'icon' && "h-10 w-10",
    // Variant styling
    variant === 'default' && "bg-primary text-primary-foreground hover:bg-primary/90",
    variant === 'destructive' && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    variant === 'outline' && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    variant === 'secondary' && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    variant === 'ghost' && "hover:bg-accent hover:text-accent-foreground",
    variant === 'link' && "text-primary underline-offset-4 hover:underline",
    // Custom classes passed
    className
  );

  // Simple click handler function
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (actionText) {
      console.log(actionText); // For debugging
      window.alert(actionText);
    }
    
    if (onClick) {
      onClick();
    }
  };

  // If href is provided, render as a Link
  if (href) {
    return (
      <Link href={href}>
        <button 
          type="button"
          className={baseClasses}
          onClick={handleButtonClick}
          {...props}
        >
          {children}
        </button>
      </Link>
    );
  }

  // Otherwise render as a regular button
  return (
    <button
      type="button"
      className={baseClasses}
      onClick={handleButtonClick}
      {...props}
    >
      {children}
    </button>
  );
}