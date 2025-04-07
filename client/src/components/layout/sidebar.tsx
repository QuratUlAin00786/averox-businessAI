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
  MoreVertical,
  CreditCard,
  MessageSquare,
  Calculator,
  PackageOpen,
  HelpCircle,
  TicketCheck,
  ShoppingCart,
  Store
} from "lucide-react";
import AveroxLogo from "@/assets/AveroxLogo";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useSystemSettings, type MenuVisibilitySettings } from "@/hooks/use-system-settings";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { settings } = useSystemSettings();

  // Items with their menu visibility key
  const navItemsWithKeys = [
    { name: t.navigation.dashboard, path: '/', icon: <LayoutDashboard className="w-5 h-5" />, key: null }, // Dashboard is always visible
    { name: t.navigation.contacts, path: '/contacts', icon: <Users className="w-5 h-5" />, key: 'contacts' as keyof MenuVisibilitySettings },
    { name: t.navigation.accounts, path: '/accounts', icon: <Briefcase className="w-5 h-5" />, key: 'accounts' as keyof MenuVisibilitySettings },
    { name: t.navigation.leads, path: '/leads', icon: <UserPlus className="w-5 h-5" />, key: 'leads' as keyof MenuVisibilitySettings },
    { name: t.navigation.opportunities, path: '/opportunities', icon: <TrendingUp className="w-5 h-5" />, key: 'opportunities' as keyof MenuVisibilitySettings },
    { name: t.navigation.calendar, path: '/calendar', icon: <Calendar className="w-5 h-5" />, key: 'calendar' as keyof MenuVisibilitySettings },
    { name: t.navigation.tasks, path: '/tasks', icon: <CheckSquare className="w-5 h-5" />, key: 'tasks' as keyof MenuVisibilitySettings },
    { name: t.navigation.communicationCenter, path: '/communication-center', icon: <MessageSquare className="w-5 h-5" />, key: 'communicationCenter' as keyof MenuVisibilitySettings },
    { name: t.navigation.accounting, path: '/accounting', icon: <Calculator className="w-5 h-5" />, key: 'accounting' as keyof MenuVisibilitySettings },
    { name: t.navigation.inventory, path: '/inventory', icon: <PackageOpen className="w-5 h-5" />, key: 'inventory' as keyof MenuVisibilitySettings },
    { name: t.navigation.supportTickets, path: '/support-tickets', icon: <TicketCheck className="w-5 h-5" />, key: 'supportTickets' as keyof MenuVisibilitySettings },
    { name: t.navigation.ecommerce, path: '/ecommerce', icon: <ShoppingCart className="w-5 h-5" />, key: 'ecommerce' as keyof MenuVisibilitySettings },
    { name: t.navigation.ecommerceStore, path: '/ecommerce-store', icon: <Store className="w-5 h-5" />, key: 'ecommerceStore' as keyof MenuVisibilitySettings },
    { name: t.navigation.reports, path: '/reports', icon: <BarChart2 className="w-5 h-5" />, key: 'reports' as keyof MenuVisibilitySettings },
    { name: t.navigation.intelligence, path: '/intelligence', icon: <BrainCircuit className="w-5 h-5" />, key: 'intelligence' as keyof MenuVisibilitySettings },
    { name: t.navigation.workflows, path: '/workflows', icon: <Workflow className="w-5 h-5" />, key: 'workflows' as keyof MenuVisibilitySettings },
    { name: t.navigation.subscriptions, path: '/subscriptions', icon: <CreditCard className="w-5 h-5" />, key: 'subscriptions' as keyof MenuVisibilitySettings },
    { name: t.navigation.training, path: '/training-help', icon: <HelpCircle className="w-5 h-5" />, key: 'training' as keyof MenuVisibilitySettings },
    { name: t.navigation.settings, path: '/settings', icon: <Settings className="w-5 h-5" />, key: null } // Settings is always visible
  ];

  // Filter navItems based on menu visibility settings
  const navItems = navItemsWithKeys.filter(item => {
    // If key is null (like Dashboard and Settings), always show it
    if (item.key === null) return true;
    
    // Otherwise check the settings
    return settings.menuVisibility[item.key];
  });

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

  // Get visible items for each section
  const getCoreItems = () => {
    return navItems.filter((_, index) => index >= 0 && index <= 6);
  };

  const getCommunicationItems = () => {
    return navItems.filter(item => item.path === '/communication-center');
  };

  const getBusinessItems = () => {
    return navItems.filter(item => 
      ['/accounting', '/inventory', '/support-tickets', '/ecommerce', '/ecommerce-store'].includes(item.path)
    );
  };

  const getAnalyticsItems = () => {
    return navItems.filter(item => 
      ['/reports', '/intelligence', '/workflows'].includes(item.path)
    );
  };

  const getSupportItems = () => {
    return navItems.filter(item => item.path === '/subscriptions' || item.path === '/training-help');
  };

  const getSystemItems = () => {
    return navItems.filter(item => item.path === '/settings');
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
          {renderNavItems(getCoreItems())}
        </div>
        
        {getCommunicationItems().length > 0 && (
          <>
            <hr className="my-4 border-neutral-200" />
            <div className="px-4 mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Communication</p>
            </div>
            <div className="px-2 space-y-1">
              {renderNavItems(getCommunicationItems())}
            </div>
          </>
        )}
        
        {getBusinessItems().length > 0 && (
          <>
            <hr className="my-4 border-neutral-200" />
            <div className="px-4 mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Business</p>
            </div>
            <div className="px-2 space-y-1">
              {renderNavItems(getBusinessItems())}
            </div>
          </>
        )}
        
        {getAnalyticsItems().length > 0 && (
          <>
            <hr className="my-4 border-neutral-200" />
            <div className="px-4 mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Analytics & Automation</p>
            </div>
            <div className="px-2 space-y-1">
              {renderNavItems(getAnalyticsItems())}
            </div>
          </>
        )}
        
        {getSupportItems().length > 0 && (
          <>
            <hr className="my-4 border-neutral-200" />
            <div className="px-4 mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Help & Support</p>
            </div>
            <div className="px-2 space-y-1">
              {renderNavItems(getSupportItems())}
            </div>
          </>
        )}

        <hr className="my-4 border-neutral-200" />
        
        <div className="px-4 mb-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">System</p>
        </div>
        <div className="px-2 space-y-1">
          {renderNavItems(getSystemItems())}
        </div>
      </ScrollArea>
      
      <div className="flex items-center p-4 border-t border-neutral-200">
        <Avatar className="w-10 h-10 border-2 border-primary">
          {user?.avatar ? (
            // Image avatar (uploaded or predefined)
            <AvatarImage 
              src={user.avatar} 
              alt={`${user?.firstName || ""} ${user?.lastName || ""}`} 
            />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {user?.firstName && user?.lastName 
                ? `${user.firstName[0]}${user.lastName[0]}`
                : user?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="ml-3 overflow-hidden">
          <p className="text-sm font-medium text-neutral-700 truncate">
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.username || "User"}
          </p>
          <p className="text-xs font-medium text-neutral-500 truncate">
            {user?.role || user?.email || ""}
          </p>
        </div>
        <Link href="/settings/profile">
          <Button 
            variant="outline" 
            size="icon" 
            className="p-1 ml-auto text-primary hover:text-primary hover:bg-primary/10 hover:border-primary"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
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
