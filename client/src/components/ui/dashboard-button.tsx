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
  const handleClick = () => {
    // Add this console log to track button clicks
    if (actionText) {
      console.log('Dashboard button clicked:', actionText);
    }
    
    // If there's a custom click handler, call it
    if (onClick) {
      onClick();
    }
    
    // If actionText is provided but no onClick, use it as a default alert
    if (actionText && !onClick) {
      window.alert(actionText);
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