import React from 'react';
import { Button, ButtonProps } from "@/components/ui/button";
import { Link } from 'wouter';

export interface SimpleButtonProps extends ButtonProps {
  children: React.ReactNode;
  href?: string;
}

export function SimpleButton({ 
  children,
  href,
  ...props 
}: SimpleButtonProps) {
  if (href) {
    return (
      <Link href={href}>
        <Button {...props}>
          {children}
        </Button>
      </Link>
    );
  }

  return (
    <Button {...props}>
      {children}
    </Button>
  );
}