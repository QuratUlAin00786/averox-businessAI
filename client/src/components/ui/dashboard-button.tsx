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
  // If href is provided, render as a Link
  if (href) {
    return (
      <Link href={href}>
        <Button {...props}>
          {children}
        </Button>
      </Link>
    );
  }

  // Otherwise render as a regular button
  return (
    <Button {...props}>
      {children}
    </Button>
  );
}