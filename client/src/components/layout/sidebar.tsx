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
  BrainCircuit,
  Workflow,
  MoreVertical
} from "lucide-react";
import AveroxLogo from "@/assets/AveroxLogo";

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
    { name: 'Intelligence', path: '/intelligence', icon: <BrainCircuit className="w-5 h-5" /> },
    { name: 'Workflows', path: '/workflows', icon: <Workflow className="w-5 h-5" /> },
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
          <Link href="/">
            <AveroxLogo height={40} />
          </Link>
        </div>
      </div>
      
      <ScrollArea className="flex-1 pt-3 pb-4">
        <div className="px-4 mb-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Core</p>
        </div>
        <div className="px-2 space-y-1">
          {renderNavItems(navItems.slice(0, 7))}
        </div>
        
        <hr className="my-4 border-neutral-200" />
        
        <div className="px-4 mb-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Analytics & Automation</p>
        </div>
        <div className="px-2 space-y-1">
          {renderNavItems(navItems.slice(7, 10))}
        </div>
        
        <hr className="my-4 border-neutral-200" />
        
        <div className="px-4 mb-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">System</p>
        </div>
        <div className="px-2 space-y-1">
          {renderNavItems(navItems.slice(10))}
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
