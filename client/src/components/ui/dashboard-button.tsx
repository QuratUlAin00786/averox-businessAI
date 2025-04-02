import React from 'react';
import { Button, ButtonProps } from "@/components/ui/button";
import { Link } from 'wouter';

export interface DashboardButtonProps extends ButtonProps {
  children: React.ReactNode;
  actionText?: string;
  onClick?: () => void;
  href?: string;
  asChild?: boolean;
}

export function DashboardButton({ 
  children, 
  actionText,
  onClick, 
  href,
  asChild = undefined,
  ...props 
}: DashboardButtonProps) {
  // Define the click handler directly, don't use a function reference
  const handleClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent parent handlers from firing
    e.stopPropagation();
    
    // Track button clicks in console
    if (actionText) {
      console.log('Dashboard button clicked:', actionText);
    }
    
    // If there's a custom click handler, call it
    if (onClick) {
      onClick();
      return;
    }
    
    // Always show the action text as an alert if provided
    if (actionText) {
      window.alert(actionText);
    }
  };

  // If href is provided, render as a Link
  if (href) {
    return (
      <Link href={href}>
        <Button 
          {...props} 
          onClick={handleClick}
          asChild={asChild}
          type="button"
        >
          {children}
        </Button>
      </Link>
    );
  }

  // Otherwise render as a regular button
  return (
    <Button
      {...props}
      onClick={handleClick}
      asChild={asChild}
      type="button"
    >
      {children}
    </Button>
  );
}