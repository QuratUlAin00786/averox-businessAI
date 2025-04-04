import React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserPlus,
  DollarSign,
  Calendar,
  ClipboardList,
  BrainCircuit,
  BarChart3,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const NavLink = ({
    href,
    icon: Icon,
    children,
  }: {
    href: string;
    icon: React.ElementType;
    children: React.ReactNode;
  }) => {
    const isActive = location === href;
    
    return (
      <Link href={href}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2",
            isActive && "bg-primary/10 text-primary"
          )}
        >
          <Icon className="h-4 w-4" />
          <span>{children}</span>
        </Button>
      </Link>
    );
  };
  
  const NavContent = () => (
    <div className="flex flex-col gap-1">
      <NavLink href="/" icon={LayoutDashboard}>
        Dashboard
      </NavLink>
      <NavLink href="/contacts" icon={Users}>
        Contacts
      </NavLink>
      <NavLink href="/accounts" icon={Building2}>
        Accounts
      </NavLink>
      <NavLink href="/leads" icon={UserPlus}>
        Leads
      </NavLink>
      <NavLink href="/opportunities" icon={DollarSign}>
        Opportunities
      </NavLink>
      <NavLink href="/tasks" icon={ClipboardList}>
        Tasks
      </NavLink>
      <NavLink href="/calendar" icon={Calendar}>
        Calendar
      </NavLink>
      <NavLink href="/intelligence" icon={BrainCircuit}>
        Intelligence
      </NavLink>
      <NavLink href="/reports" icon={BarChart3}>
        Reports
      </NavLink>
      <Separator className="my-2" />
      <NavLink href="/subscriptions" icon={DollarSign}>
        Subscriptions
      </NavLink>
      <NavLink href="/settings" icon={Settings}>
        Settings
      </NavLink>
      <div className="mt-auto">
        <Button variant="ghost" className="w-full justify-start gap-2">
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-background border-r p-4">
        <div className="flex items-center gap-2 py-4 px-2 mb-6">
          <div className="font-semibold text-xl">AVEROX CRM</div>
        </div>
        <NavContent />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-10 w-full bg-background border-b p-3 flex items-center justify-between">
        <div className="font-semibold">AVEROX CRM</div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4">
            <div className="font-semibold text-xl mb-6">AVEROX CRM</div>
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 md:pl-0 flex flex-col">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}