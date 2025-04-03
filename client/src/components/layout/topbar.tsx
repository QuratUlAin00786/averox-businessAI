import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Search, 
  Menu, 
  Bell, 
  MessageCircle, 
  Plus,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Globe
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AveroxLogo from "@/assets/AveroxLogo";

interface TopBarProps {
  onToggleSidebar: () => void;
}

export default function TopBar({ onToggleSidebar }: TopBarProps) {
  const [, setLocation] = useLocation();
  
  return (
    <div className="relative z-10 flex flex-shrink-0 h-16 bg-white shadow">
      <Button 
        variant="ghost" 
        size="icon" 
        className="px-4 text-neutral-500 focus:ring-primary md:hidden"
        onClick={onToggleSidebar}
      >
        <Menu className="w-6 h-6" />
      </Button>
      
      <div className="flex justify-between flex-1 px-4">
        <div className="flex flex-1 items-center">
          {/* Mobile logo visible in topbar when sidebar is closed */}
          <div className="flex md:hidden mr-3">
            <AveroxLogo height={24} />
          </div>
          <div className="flex items-center w-full max-w-2xl px-2 ml-4 md:ml-0">
            <div className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-5 h-5 text-neutral-400" />
                </div>
                <Input 
                  id="search" 
                  name="search" 
                  className="block w-full py-2 pl-10 pr-3 text-sm placeholder-neutral-400 bg-neutral-50 border-neutral-200"
                  placeholder="Search" 
                  type="search"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center ml-4 md:ml-6">
          {/* Create New Button with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="default" 
                className="inline-flex items-center mr-3 bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Records</DropdownMenuLabel>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => {
                  window.alert("Creating new contact...");
                  setLocation("/contacts?new=true");
                }}
              >
                <span>Contact</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => {
                  window.alert("Creating new account...");
                  setLocation("/accounts?new=true");
                }}
              >
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => {
                  window.alert("Creating new lead...");
                  setLocation("/leads?new=true");
                }}
              >
                <span>Lead</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => {
                  window.alert("Creating new opportunity...");
                  setLocation("/opportunities?new=true");
                }}
              >
                <span>Opportunity</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Activities</DropdownMenuLabel>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => {
                  window.alert("Creating new task...");
                  setLocation("/tasks?new=true");
                }}
              >
                <span>Task</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => {
                  window.alert("Creating new event...");
                  setLocation("/calendar?new=true");
                }}
              >
                <span>Event</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Notification button */}
          <Button variant="ghost" size="icon" className="p-1 ml-3 text-neutral-400 hover:text-neutral-500">
            <span className="sr-only">View notifications</span>
            <div className="relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-destructive rounded-full">3</span>
            </div>
          </Button>
          
          {/* Messages button */}
          <Button variant="ghost" size="icon" className="p-1 ml-3 text-neutral-400 hover:text-neutral-500">
            <span className="sr-only">View messages</span>
            <div className="relative">
              <MessageCircle className="w-6 h-6" />
              <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-primary rounded-full">5</span>
            </div>
          </Button>
          
          {/* Profile dropdown */}
          <div className="relative ml-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="flex items-center max-w-xs text-sm bg-white rounded-full focus:ring-primary" id="user-menu-button">
                  <span className="sr-only">Open user menu</span>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1506863530036-1efeddceb993?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Sarah Johnson" />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Sarah Johnson</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      s.johnson@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Globe className="w-4 h-4 mr-2" />
                    <span>Language</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  <span>Help & Documentation</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
