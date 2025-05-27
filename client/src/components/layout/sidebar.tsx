import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import * as LucideIcons from "lucide-react";
import AveroxLogo from "@/assets/AveroxLogo";
import averoxLogoImg from "@assets/averox logo origingal file.png";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useSystemSettings, type MenuVisibilitySettings } from "@/hooks/use-system-settings";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SidebarProps {
  className?: string;
}

interface MenuItem {
  name: string;
  path: string;
  icon: string;
  key: keyof MenuVisibilitySettings | null;
  isVisible: boolean;
  isSubmenu?: boolean;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  key: keyof MenuVisibilitySettings | null;
  isSubmenu?: boolean;
}

// Dynamic icon renderer - renders a Lucide icon by its string name
const DynamicIcon = ({ name, className = "w-5 h-5" }: { name: string; className?: string }) => {
  const IconComponent = LucideIcons[name as keyof typeof LucideIcons] || LucideIcons.CircleDashed;
  return <IconComponent className={className} />;
};

export default function Sidebar({ className = "" }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { settings } = useSystemSettings();

  // Fetch menu items from the database
  const { data: menuItems = [], isLoading: isMenuLoading, refetch } = useQuery({
    queryKey: ["/api/menu-items"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/menu-items");
        return await res.json() as MenuItem[];
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
        return [] as MenuItem[];
      }
    },
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 0, // Force refresh every time
    cacheTime: 0, // Don't cache results
  });

  // Auto-refresh menu items to show new features
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        refetch();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, refetch]);

  // Convert menu items to nav items
  const navItems: NavItem[] = menuItems.map(item => {
    return {
      name: item.name,
      path: item.path,
      icon: <DynamicIcon name={item.icon} />,
      key: item.key as keyof MenuVisibilitySettings | null,
      isSubmenu: item.isSubmenu,
      // Use item's visibility from API result
    };
  }).filter(item => {
    // Filter out items that are not visible
    const menuItem = menuItems.find(mi => mi.path === item.path);
    return menuItem ? menuItem.isVisible : true;
  });

  // Fallback to hardcoded items if menu items API fails or returns empty
  const getHardcodedNavItems = (): NavItem[] => [
    { name: t.navigation.dashboard, path: '/', icon: <LucideIcons.LayoutDashboard className="w-5 h-5" />, key: null },
    { name: t.navigation.contacts, path: '/contacts', icon: <LucideIcons.Users className="w-5 h-5" />, key: 'contacts' as keyof MenuVisibilitySettings },
    { name: t.navigation.accounts, path: '/accounts', icon: <LucideIcons.Briefcase className="w-5 h-5" />, key: 'accounts' as keyof MenuVisibilitySettings },
    { name: t.navigation.leads, path: '/leads', icon: <LucideIcons.UserPlus className="w-5 h-5" />, key: 'leads' as keyof MenuVisibilitySettings },
    { name: t.navigation.opportunities, path: '/opportunities', icon: <LucideIcons.TrendingUp className="w-5 h-5" />, key: 'opportunities' as keyof MenuVisibilitySettings },
    { name: t.navigation.calendar, path: '/calendar', icon: <LucideIcons.Calendar className="w-5 h-5" />, key: 'calendar' as keyof MenuVisibilitySettings },
    { name: t.navigation.tasks, path: '/tasks', icon: <LucideIcons.CheckSquare className="w-5 h-5" />, key: 'tasks' as keyof MenuVisibilitySettings },
    { name: "Marketing", path: '/marketing', icon: <LucideIcons.Megaphone className="w-5 h-5" />, key: null },
    { name: "Email Campaigns", path: '/marketing/create', icon: <LucideIcons.Mail className="w-5 h-5" />, key: null, isSubmenu: true },
    { name: "Automations", path: '/marketing/automations', icon: <LucideIcons.Workflow className="w-5 h-5" />, key: null, isSubmenu: true },
    { name: "Email Templates", path: '/marketing/email-template-editor', icon: <LucideIcons.Mail className="w-5 h-5" />, key: null, isSubmenu: true },
    { name: "Audience Segments", path: '/marketing/segment-builder', icon: <LucideIcons.Users className="w-5 h-5" />, key: null, isSubmenu: true },
    { name: t.navigation.communicationCenter, path: '/communication-center', icon: <LucideIcons.MessageSquare className="w-5 h-5" />, key: 'communicationCenter' as keyof MenuVisibilitySettings },
    { name: t.navigation.accounting, path: '/accounting', icon: <LucideIcons.Calculator className="w-5 h-5" />, key: 'accounting' as keyof MenuVisibilitySettings },
    { name: "Manufacturing", path: '/manufacturing', icon: <LucideIcons.Factory className="w-5 h-5" />, key: null },
    { name: "Production Lines", path: '/manufacturing/production-lines', icon: <LucideIcons.Workflow className="w-5 h-5" />, key: null, isSubmenu: true },
    { name: "Warehouses", path: '/manufacturing/warehouses', icon: <LucideIcons.Warehouse className="w-5 h-5" />, key: null, isSubmenu: true },
    { name: "Quality Control", path: '/manufacturing/quality-control', icon: <LucideIcons.CheckSquare className="w-5 h-5" />, key: null, isSubmenu: true },
    { name: "Work Orders", path: '/manufacturing/work-orders', icon: <LucideIcons.FileText className="w-5 h-5" />, key: null, isSubmenu: true },
    // SAP-level Materials Management submenu items
    { name: "MRP Planning", path: '/manufacturing/materials/mrp', icon: <LucideIcons.TrendingUp className="w-5 h-5" />, key: null, isSubmenu: true },
    { name: "Vendor Management", path: '/manufacturing/materials/vendors', icon: <LucideIcons.Users className="w-5 h-5" />, key: null, isSubmenu: true },
    { name: "Storage Bins", path: '/manufacturing/materials/storage-bins', icon: <LucideIcons.Warehouse className="w-5 h-5" />, key: null, isSubmenu: true },
    { name: "Batch/Lot Control", path: '/manufacturing/materials/batch-lot', icon: <LucideIcons.BarChart2 className="w-5 h-5" />, key: null, isSubmenu: true },
    { name: "Material Valuations", path: '/manufacturing/materials/valuations', icon: <LucideIcons.Calculator className="w-5 h-5" />, key: null, isSubmenu: true },
    { name: "Returns Management", path: '/manufacturing/materials/returns', icon: <LucideIcons.PackageOpen className="w-5 h-5" />, key: null, isSubmenu: true },
    { name: "Global Trade", path: '/manufacturing/materials/compliance', icon: <LucideIcons.Briefcase className="w-5 h-5" />, key: null, isSubmenu: true },
    { name: t.navigation.inventory, path: '/inventory', icon: <LucideIcons.PackageOpen className="w-5 h-5" />, key: 'inventory' as keyof MenuVisibilitySettings },
    { name: t.navigation.supportTickets, path: '/support-tickets', icon: <LucideIcons.TicketCheck className="w-5 h-5" />, key: 'supportTickets' as keyof MenuVisibilitySettings },
    { name: t.navigation.ecommerce, path: '/ecommerce', icon: <LucideIcons.ShoppingCart className="w-5 h-5" />, key: 'ecommerce' as keyof MenuVisibilitySettings },
    { name: t.navigation.ecommerceStore, path: '/ecommerce-store', icon: <LucideIcons.Store className="w-5 h-5" />, key: 'ecommerceStore' as keyof MenuVisibilitySettings },
    { name: t.navigation.reports, path: '/reports', icon: <LucideIcons.BarChart2 className="w-5 h-5" />, key: 'reports' as keyof MenuVisibilitySettings },
    { name: "Analytics", path: '/analytics', icon: <LucideIcons.TrendingUp className="w-5 h-5" />, key: null },
    { name: t.navigation.intelligence, path: '/intelligence', icon: <LucideIcons.BrainCircuit className="w-5 h-5" />, key: 'intelligence' as keyof MenuVisibilitySettings },
    { name: t.navigation.workflows, path: '/workflows', icon: <LucideIcons.Workflow className="w-5 h-5" />, key: 'workflows' as keyof MenuVisibilitySettings },
    { name: "Integrations", path: '/integrations', icon: <LucideIcons.Zap className="w-5 h-5" />, key: null },
    { name: t.navigation.subscriptions, path: '/subscriptions', icon: <LucideIcons.CreditCard className="w-5 h-5" />, key: 'subscriptions' as keyof MenuVisibilitySettings },
    { name: t.navigation.training, path: '/training-help', icon: <LucideIcons.HelpCircle className="w-5 h-5" />, key: 'training' as keyof MenuVisibilitySettings },
    { name: t.navigation.settings, path: '/settings', icon: <LucideIcons.Settings className="w-5 h-5" />, key: null },
    { name: "Security", path: '/security', icon: <LucideIcons.ShieldCheck className="w-5 h-5" />, key: null }
  ].filter(item => {
    // If key is null (like Dashboard and Settings), always show it
    if (item.key === null) return true;
    
    // Otherwise check the settings
    return settings.menuVisibility[item.key];
  });

  // If API request fails or returns no items, use hardcoded items
  const finalNavItems = navItems.length > 0 ? navItems : getHardcodedNavItems();

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
              : 'text-neutral-600 hover:bg-neutral-50'}
            ${item.isSubmenu ? 'ml-4' : ''}`}
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
    // Include all main navigation items plus marketing submenu items (if Marketing is expanded)
    return finalNavItems.filter((item, index) => {
      // Include all the standard core items
      if (index >= 0 && index <= 7) {
        return true;
      }
      
      // Also include marketing submenu items 
      if (item.isSubmenu && index > 7 && index <= 11) {
        return true;
      }
      
      return false;
    });
  };

  const getCommunicationItems = () => {
    return finalNavItems.filter(item => item.path === '/communication-center');
  };

  const getBusinessItems = () => {
    return finalNavItems.filter(item => 
      ['/accounting', '/manufacturing', '/inventory', '/support-tickets', '/ecommerce', '/ecommerce-store'].includes(item.path)
    );
  };
  
  // Get Manufacturing submenu items
  const getManufacturingItems = () => {
    return finalNavItems.filter(item => 
      item.isSubmenu && [
        '/manufacturing/production-lines',
        '/manufacturing/workcenters',
        '/manufacturing/warehouses',
        '/manufacturing/quality-control',
        '/manufacturing/quality',
        '/manufacturing/bom',
        '/manufacturing/production',
        '/manufacturing/work-orders',
        '/manufacturing/maintenance',
        '/manufacturing/materials/mrp',
        '/manufacturing/materials/vendors',
        '/manufacturing/materials/storage-bins',
        '/manufacturing/materials/batch-lot',
        '/manufacturing/materials/valuations',
        '/manufacturing/materials/returns',
        '/manufacturing/materials/compliance'
      ].includes(item.path)
    );
  };

  const getAnalyticsItems = () => {
    return finalNavItems.filter(item => 
      ['/reports', '/analytics', '/intelligence', '/workflows', '/integrations'].includes(item.path)
    );
  };

  const getSupportItems = () => {
    return finalNavItems.filter(item => item.path === '/subscriptions' || item.path === '/training-help');
  };

  const getSystemItems = () => {
    return finalNavItems.filter(item => item.path === '/settings' || item.path === '/security');
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-center h-16 px-4 border-b border-neutral-200">
        <div className="flex flex-col items-center">
          <Link href="/dashboard" className="flex flex-col items-center hover:opacity-80 transition-opacity">
            <img 
              src={averoxLogoImg}
              alt="Averox Logo" 
              className="h-8 w-auto mb-1 object-contain"
            />
            <span className="text-xs font-semibold text-gray-700">Business AI</span>
          </Link>
        </div>
      </div>
      
      <ScrollArea className="flex-1 pt-3 pb-4">
        {/* Core Section - Always visible */}
        <div className="px-4 mb-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Core</p>
        </div>
        <div className="px-2 space-y-1 min-h-[200px]">
          {renderNavItems(getCoreItems())}
        </div>
        
        {/* Communication Section - Always reserve space */}
        <hr className="my-4 border-neutral-200" />
        <div className="px-4 mb-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Communication</p>
        </div>
        <div className="px-2 space-y-1 min-h-[80px]">
          {renderNavItems(getCommunicationItems())}
        </div>
        
        {/* Business Section - Always reserve space */}
        <hr className="my-4 border-neutral-200" />
        <div className="px-4 mb-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Business</p>
        </div>
        <div className="px-2 space-y-1 min-h-[120px]">
          {renderNavItems(getBusinessItems())}
          {/* Add Manufacturing submenu items after Manufacturing menu item */}
          {isActive('/manufacturing') && getManufacturingItems().length > 0 && (
            <div className="mt-1 border-l-2 border-primary pl-2">
              {renderNavItems(getManufacturingItems())}
            </div>
          )}
        </div>
        
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
            <LucideIcons.Settings className="w-5 h-5" />
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
