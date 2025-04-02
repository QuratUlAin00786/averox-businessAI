import { Link, useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  UserPlus, 
  TrendingUp, 
  Calendar, 
  CheckSquare, 
  BarChart2, 
  Settings,
  MoreVertical
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Contacts', path: '/contacts', icon: <Users className="w-5 h-5" /> },
    { name: 'Accounts', path: '/accounts', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Leads', path: '/leads', icon: <UserPlus className="w-5 h-5" /> },
    { name: 'Opportunities', path: '/opportunities', icon: <TrendingUp className="w-5 h-5" /> },
    { name: 'Calendar', path: '/calendar', icon: <Calendar className="w-5 h-5" /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { name: 'Reports', path: '/reports', icon: <BarChart2 className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> }
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  // Added a common navigation rendering function for reuse
  const renderNavItems = (items: typeof navItems) => {
    return items.map((item) => (
      <Link key={item.path} href={item.path}>
        <div 
          className={`sidebar-nav-item flex items-center px-3 py-2 text-sm font-medium rounded-md group cursor-pointer
            ${isActive(item.path) 
              ? 'text-primary bg-blue-50' 
              : 'text-neutral-600 hover:bg-neutral-50'}`}
        >
          <span className={`mr-3 ${isActive(item.path) ? 'text-primary' : 'text-neutral-500 group-hover:text-primary'}`}>
            {item.icon}
          </span>
          {item.name}
        </div>
      </Link>
    ));
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-center h-16 px-4 border-b border-neutral-200">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.5 2C13.5 2 15.16 2.38 17.59 4.88C20.34 7.73 20.5 11 20.5 11C20.5 11 20.35 7.67 17.61 4.88C15.18 2.38 13.5 2 13.5 2Z" />
            <path d="M19.5 13C19.5 13 19.13 14.66 16.63 17.09C13.78 19.84 10.5 20 10.5 20C10.5 20 13.83 19.85 16.62 17.11C19.12 14.68 19.5 13 19.5 13Z" />
            <path d="M11 22.5C11 22.5 9.34 22.12 6.91 19.62C4.06 16.87 3.9 13.59 3.9 13.59C3.9 13.59 4.05 16.92 6.79 19.71C9.22 22.21 11 22.5 11 22.5Z" />
            <path d="M4.5 11.5C4.5 11.5 4.87 9.84 7.37 7.41C10.22 4.66 13.5 4.5 13.5 4.5C13.5 4.5 10.17 4.65 7.38 7.39C4.88 9.82 4.5 11.5 4.5 11.5Z" />
          </svg>
          <span className="ml-2 text-xl font-semibold tracking-wider text-neutral-600">AVEROX CRM</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 pt-3 pb-4">
        <div className="px-2 space-y-1">
          {renderNavItems(navItems.slice(0, 7))}
        </div>
        
        <hr className="my-4 border-neutral-200" />
        
        <div className="px-2 space-y-1">
          {renderNavItems(navItems.slice(7))}
        </div>
      </ScrollArea>
      
      <div className="flex items-center p-4 border-t border-neutral-200">
        <Avatar className="w-9 h-9">
          <AvatarImage src="https://images.unsplash.com/photo-1506863530036-1efeddceb993?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Sarah Johnson" />
          <AvatarFallback>SJ</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <p className="text-sm font-medium text-neutral-700">Sarah Johnson</p>
          <p className="text-xs font-medium text-neutral-500">Marketing Director</p>
        </div>
        <Button variant="ghost" size="icon" className="p-1 ml-auto text-neutral-400 hover:text-neutral-500">
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </>
  );

  return (
    <div className={`flex-shrink-0 ${className}`}>
      <div className="flex flex-col w-64 bg-white border-r border-neutral-200 h-full">
        {sidebarContent}
      </div>
    </div>
  );
}
