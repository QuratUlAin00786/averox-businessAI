import React from 'react';
import { Button, ButtonProps } from "@/components/ui/button";
import { Link } from 'wouter';

export interface DashboardButtonProps extends ButtonProps {
  children: React.ReactNode;
  actionText?: string;
  onClick?: () => void;
  href?: string;
}

export function DashboardButton({ 
  children, 
  actionText,
  onClick, 
  href,
  ...props 
}: DashboardButtonProps) {
  // Create a click handler function that shows action text and calls onClick if provided
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Always stop propagation for consistent behavior
    e.stopPropagation();
    
    // Show action text if provided
    if (actionText) {
      console.log(actionText); // Log to console for debugging
      window.alert(actionText);
    }
    
    // Call custom onClick if provided
    if (onClick) {
      onClick();
    }
  };

  // If href is provided, render as a Link with a Button child
  if (href) {
    return (
      <Link href={href}>
        <Button 
          type="button" 
          {...props} 
          onClick={handleClick}
        >
          {children}
        </Button>
      </Link>
    );
  }

  // Otherwise render as a regular button
  return (
    <Button
      type="button"
      {...props}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}