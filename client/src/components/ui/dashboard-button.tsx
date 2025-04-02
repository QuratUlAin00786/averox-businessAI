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
  // Simple click handler function
  const handleClick = (e: React.MouseEvent) => {
    // Show action text if provided
    if (actionText) {
      window.alert(actionText);
    }
    
    // Call custom onClick if provided
    if (onClick) {
      onClick();
    }
  };

  // If href is provided, render as a Link
  if (href) {
    return (
      <Link href={href}>
        <Button {...props} onClick={handleClick}>
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
    >
      {children}
    </Button>
  );
}