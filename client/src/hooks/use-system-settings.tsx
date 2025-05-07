import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Define the menu visibility structure
export interface MenuVisibilitySettings {
  contacts: boolean;
  accounts: boolean;
  leads: boolean;
  opportunities: boolean;
  calendar: boolean;
  tasks: boolean;
  communicationCenter: boolean;
  accounting: boolean;
  inventory: boolean;
  supportTickets: boolean;
  ecommerce: boolean;
  ecommerceStore: boolean;
  reports: boolean;
  intelligence: boolean;
  workflows: boolean;
  subscriptions: boolean;
  training: boolean;
}

import { DashboardPreferences } from '@shared/schema';

// Define the system settings interface
export interface SystemSettings {
  menuVisibility: MenuVisibilitySettings;
  dashboardPreferences: DashboardPreferences;
  // Other system settings can be added here
}

// Default values for menu visibility (all enabled)
export const DEFAULT_MENU_VISIBILITY: MenuVisibilitySettings = {
  contacts: true,
  accounts: true,
  leads: true,
  opportunities: true,
  calendar: true,
  tasks: true,
  communicationCenter: true,
  accounting: true,
  inventory: true,
  supportTickets: true,
  ecommerce: true,
  ecommerceStore: true,
  reports: true,
  intelligence: true,
  workflows: true,
  subscriptions: true,
  training: true,
};

// Default values for dashboard preferences
export const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
  // Graph and chart preferences
  showSalesPipeline: true,
  showRecentActivities: true,
  showTasks: true,
  showEvents: true,
  
  // Stat preferences
  showLeadsStats: true,
  showConversionStats: true,
  showRevenueStats: true,
  showOpportunitiesStats: true,
  
  // Graph type preferences
  pipelineChartType: 'pie',
  revenueChartType: 'line',
  leadsChartType: 'line',
  
  // Time range preferences
  defaultTimeRange: 'month',
  
  // AI insights preferences
  showAIInsights: true,
  aiInsightTypes: ['leads', 'opportunities', 'revenue'],
  aiInsightsCount: 3
};

// Default system settings
export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  menuVisibility: DEFAULT_MENU_VISIBILITY,
  dashboardPreferences: DEFAULT_DASHBOARD_PREFERENCES,
};

type SystemSettingsContextType = {
  settings: SystemSettings;
  isLoading: boolean;
  error: Error | null;
  updateMenuVisibility: (menuItem: keyof MenuVisibilitySettings, value: boolean) => void;
  updateDashboardWidgets: (widgetKey: keyof DashboardPreferences, value: boolean | string | string[]) => void;
  updateDashboardChartType: (chartKey: 'pipelineChartType' | 'revenueChartType' | 'leadsChartType', value: 'pie' | 'bar' | 'line' | 'funnel' | 'area') => void;
  updateDashboardTimeRange: (value: 'week' | 'month' | 'quarter' | 'year') => void;
  saveSettings: () => void;
  isUpdating: boolean;
};

export const SystemSettingsContext = createContext<SystemSettingsContextType | null>(null);

export function SystemSettingsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  
  const {
    data,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["/api/system-settings"],
    queryFn: async () => {
      try {
        console.log("Attempting to fetch system settings with auth status:", !!user);
        // Additional check to ensure we don't make the request if not authenticated
        if (!user) {
          console.log("User not authenticated, returning default settings");
          return DEFAULT_SYSTEM_SETTINGS;
        }
        
        const res = await apiRequest("GET", "/api/system-settings");
        const responseData = await res.json();
        console.log("System settings loaded successfully:", responseData);
        return responseData;
      } catch (error) {
        console.error("Failed to fetch system settings:", error);
        // Return default settings on error
        return DEFAULT_SYSTEM_SETTINGS;
      }
    },
    enabled: !!user, // Only fetch if user is logged in
    retry: false, // Don't retry if request fails
  });
  
  // Update local settings when data is fetched
  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);
  
  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/system-settings", settings);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-settings"] });
      toast({
        title: "Settings Saved",
        description: "Your system settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const updateMenuVisibility = (menuItem: keyof MenuVisibilitySettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      menuVisibility: {
        ...prev.menuVisibility,
        [menuItem]: value,
      }
    }));
  };

  const updateDashboardWidgets = (
    widgetKey: keyof DashboardPreferences, 
    value: boolean | string | string[]
  ) => {
    setSettings(prev => ({
      ...prev,
      dashboardPreferences: {
        ...prev.dashboardPreferences,
        [widgetKey]: value,
      }
    }));
  };

  const updateDashboardChartType = (chartKey: 'pipelineChartType' | 'revenueChartType' | 'leadsChartType', 
    value: 'pie' | 'bar' | 'line' | 'funnel' | 'area') => {
    setSettings(prev => ({
      ...prev,
      dashboardPreferences: {
        ...prev.dashboardPreferences,
        [chartKey]: value,
      }
    }));
  };

  const updateDashboardTimeRange = (value: 'week' | 'month' | 'quarter' | 'year') => {
    setSettings(prev => ({
      ...prev,
      dashboardPreferences: {
        ...prev.dashboardPreferences,
        defaultTimeRange: value,
      }
    }));
  };
  
  const saveSettings = () => {
    saveSettingsMutation.mutate();
  };
  
  return (
    <SystemSettingsContext.Provider
      value={{
        settings,
        isLoading,
        error,
        updateMenuVisibility,
        updateDashboardWidgets,
        updateDashboardChartType,
        updateDashboardTimeRange,
        saveSettings,
        isUpdating: saveSettingsMutation.isPending,
      }}
    >
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings() {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error("useSystemSettings must be used within a SystemSettingsProvider");
  }
  return context;
}