import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  BellRing, 
  Layout, 
  Languages, 
  Loader2,
  MailCheck, 
  Menu, 
  Save, 
  Shield,
  Smartphone,
  ToggleLeft
} from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useSystemSettings } from "@/hooks/use-system-settings";

export default function SettingsSystem() {
  const { toast } = useToast();
  const { language, isRTL, setLanguage, setRTL, t } = useLanguage();
  const { settings, updateMenuVisibility, saveSettings, isUpdating } = useSystemSettings();
  
  const [formData, setFormData] = useState({
    language: "english",
    timezone: "utc-5",
    dateFormat: "mm/dd/yyyy",
    emailNotifications: true,
    smsNotifications: false,
    desktopNotifications: true,
    twoFactorAuth: false,
    dataExport: false,
    activityLogging: true,
    rtlLayout: false,
  });
  
  // Initialize form data from language context
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      language,
      rtlLayout: isRTL
    }));
  }, []);

  const handleSwitchChange = (field: string) => {
    const newValue = !formData[field as keyof typeof formData];
    
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }));
    
    // If toggling RTL layout, update the language context
    if (field === "rtlLayout") {
      setRTL(newValue);
    }
  };
  
  const handleMenuVisibilityChange = (menuItem: keyof typeof settings.menuVisibility, checked: boolean) => {
    updateMenuVisibility(menuItem, checked);
  };

  const handleSelectChange = (field: string, value: string) => {
    // If switching to Arabic, suggest enabling RTL layout
    if (field === "language" && value === "arabic") {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        rtlLayout: true
      }));
      
      // Update application language and RTL setting
      setLanguage(value as any);
      setRTL(true);
      
      toast({
        title: "RTL Layout Enabled",
        description: "Right-to-left layout has been enabled for Arabic language support.",
      });
    } 
    // If switching from Arabic to another language and RTL is enabled, suggest disabling RTL
    else if (field === "language" && formData.language === "arabic" && formData.rtlLayout) {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        rtlLayout: false
      }));
      
      // Update application language and RTL setting
      setLanguage(value as any);
      setRTL(false);
      
      toast({
        title: "RTL Layout Disabled",
        description: "Right-to-left layout has been disabled as it's not needed for the selected language.",
      });
    } 
    // Normal case for other field changes
    else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      
      // If it's a language change, update the application language
      if (field === "language") {
        setLanguage(value as any);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Save the system settings including menu visibility
      await saveSettings();
      
      toast({
        title: "Settings Saved",
        description: "Your system settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="py-6">
      <div className="px-4 mx-auto max-w-4xl sm:px-6 md:px-8">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h2 className="text-2xl font-bold leading-7 text-neutral-600 sm:text-3xl sm:truncate">
                {t.settings.system}
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Languages className="mr-2 h-5 w-5" />
                    {t.settings.regional}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">{t.settings.language}</Label>
                        <Select 
                          value={formData.language} 
                          onValueChange={(value) => handleSelectChange("language", value)}
                        >
                          <SelectTrigger id="language">
                            <SelectValue placeholder={`${t.general.select} ${t.settings.language.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="arabic">Arabic (العربية)</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="german">German</SelectItem>
                            <SelectItem value="chinese">Chinese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="timezone">{t.settings.timezone}</Label>
                        <Select 
                          value={formData.timezone} 
                          onValueChange={(value) => handleSelectChange("timezone", value)}
                        >
                          <SelectTrigger id="timezone">
                            <SelectValue placeholder={`${t.general.select} ${t.settings.timezone.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="utc-8">UTC-8 Pacific Time</SelectItem>
                            <SelectItem value="utc-7">UTC-7 Mountain Time</SelectItem>
                            <SelectItem value="utc-6">UTC-6 Central Time</SelectItem>
                            <SelectItem value="utc-5">UTC-5 Eastern Time</SelectItem>
                            <SelectItem value="utc+0">UTC+0 Greenwich Mean Time</SelectItem>
                            <SelectItem value="utc+1">UTC+1 Central European Time</SelectItem>
                            <SelectItem value="utc+3-ksa">UTC+3 Arabia Standard Time (Saudi Arabia)</SelectItem>
                            <SelectItem value="utc+3-kuwait">UTC+3 Eastern Europe Time (Kuwait, Qatar)</SelectItem>
                            <SelectItem value="utc+4">UTC+4 Gulf Standard Time (UAE)</SelectItem>
                            <SelectItem value="utc+8">UTC+8 China Standard Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dateFormat">{t.settings.dateFormat}</Label>
                        <Select 
                          value={formData.dateFormat} 
                          onValueChange={(value) => handleSelectChange("dateFormat", value)}
                        >
                          <SelectTrigger id="dateFormat">
                            <SelectValue placeholder={`${t.general.select} ${t.settings.dateFormat.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                            <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                            <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                            <SelectItem value="dd.mm.yyyy">DD.MM.YYYY</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="rtlLayout">{t.settings.rtlLayout}</Label>
                          <div className="text-sm text-muted-foreground">
                            {t.settings.rtlLayoutDescription}
                          </div>
                        </div>
                        <Switch
                          id="rtlLayout"
                          checked={formData.rtlLayout}
                          onCheckedChange={() => handleSwitchChange("rtlLayout")}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BellRing className="mr-2 h-5 w-5" />
                    {t.settings.notifications}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">{t.settings.emailNotifications}</Label>
                        <div className="text-sm text-muted-foreground">
                          {t.settings.emailNotificationsDescription}
                        </div>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={formData.emailNotifications}
                        onCheckedChange={() => handleSwitchChange("emailNotifications")}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="smsNotifications">{t.settings.smsNotifications}</Label>
                        <div className="text-sm text-muted-foreground">
                          {t.settings.smsNotificationsDescription}
                        </div>
                      </div>
                      <Switch
                        id="smsNotifications"
                        checked={formData.smsNotifications}
                        onCheckedChange={() => handleSwitchChange("smsNotifications")}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="desktopNotifications">{t.settings.desktopNotifications}</Label>
                        <div className="text-sm text-muted-foreground">
                          {t.settings.desktopNotificationsDescription}
                        </div>
                      </div>
                      <Switch
                        id="desktopNotifications"
                        checked={formData.desktopNotifications}
                        onCheckedChange={() => handleSwitchChange("desktopNotifications")}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    {t.settings.security}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="twoFactorAuth">{t.settings.twoFactorAuth}</Label>
                        <div className="text-sm text-muted-foreground">
                          {t.settings.twoFactorAuthDescription}
                        </div>
                      </div>
                      <Switch
                        id="twoFactorAuth"
                        checked={formData.twoFactorAuth}
                        onCheckedChange={() => handleSwitchChange("twoFactorAuth")}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="dataExport">{t.settings.dataExport}</Label>
                        <div className="text-sm text-muted-foreground">
                          {t.settings.dataExportDescription}
                        </div>
                      </div>
                      <Switch
                        id="dataExport"
                        checked={formData.dataExport}
                        onCheckedChange={() => handleSwitchChange("dataExport")}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="activityLogging">{t.settings.activityLogging}</Label>
                        <div className="text-sm text-muted-foreground">
                          {t.settings.activityLoggingDescription}
                        </div>
                      </div>
                      <Switch
                        id="activityLogging"
                        checked={formData.activityLogging}
                        onCheckedChange={() => handleSwitchChange("activityLogging")}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ToggleLeft className="mr-2 h-5 w-5" />
                    Menu Visibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Enable or disable menu items in the navigation sidebar. This allows you to customize the user interface based on your organization's needs.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="contacts">Contacts</Label>
                        <Switch
                          id="contacts"
                          checked={settings.menuVisibility.contacts}
                          onCheckedChange={(checked) => handleMenuVisibilityChange("contacts", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="accounts">Accounts</Label>
                        <Switch
                          id="accounts"
                          checked={settings.menuVisibility.accounts}
                          onCheckedChange={(checked) => handleMenuVisibilityChange("accounts", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="leads">Leads</Label>
                        <Switch
                          id="leads"
                          checked={settings.menuVisibility.leads}
                          onCheckedChange={(checked) => handleMenuVisibilityChange("leads", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="opportunities">Opportunities</Label>
                        <Switch
                          id="opportunities"
                          checked={settings.menuVisibility.opportunities}
                          onCheckedChange={(checked) => handleMenuVisibilityChange("opportunities", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="calendar">Calendar</Label>
                        <Switch
                          id="calendar"
                          checked={settings.menuVisibility.calendar}
                          onCheckedChange={(checked) => handleMenuVisibilityChange("calendar", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="tasks">Tasks</Label>
                        <Switch
                          id="tasks"
                          checked={settings.menuVisibility.tasks}
                          onCheckedChange={(checked) => handleMenuVisibilityChange("tasks", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="communicationCenter">Communication Center</Label>
                        <Switch
                          id="communicationCenter"
                          checked={settings.menuVisibility.communicationCenter}
                          onCheckedChange={(checked) => handleMenuVisibilityChange("communicationCenter", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="accounting">Accounting</Label>
                        <Switch
                          id="accounting"
                          checked={settings.menuVisibility.accounting}
                          onCheckedChange={(checked) => handleMenuVisibilityChange("accounting", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="inventory">Inventory</Label>
                        <Switch
                          id="inventory"
                          checked={settings.menuVisibility.inventory}
                          onCheckedChange={(checked) => handleMenuVisibilityChange("inventory", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="supportTickets">Support Tickets</Label>
                        <Switch
                          id="supportTickets"
                          checked={settings.menuVisibility.supportTickets}
                          onCheckedChange={(checked) => handleMenuVisibilityChange("supportTickets", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ecommerce">E-commerce</Label>
                        <Switch
                          id="ecommerce"
                          checked={settings.menuVisibility.ecommerce}
                          onCheckedChange={(checked) => handleMenuVisibilityChange("ecommerce", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ecommerceStore">E-commerce Store</Label>
                        <Switch
                          id="ecommerceStore"
                          checked={settings.menuVisibility.ecommerceStore}
                          onCheckedChange={(checked) => handleMenuVisibilityChange("ecommerceStore", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="reports">Reports</Label>
                        <Switch
                          id="reports"
                          checked={settings.menuVisibility.reports}
                          onCheckedChange={(checked) => handleMenuVisibilityChange("reports", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="intelligence">Intelligence</Label>
                        <Switch
                          id="intelligence"
                          checked={settings.menuVisibility.intelligence}
                          onCheckedChange={(checked) => handleMenuVisibilityChange("intelligence", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="workflows">Workflows</Label>
                        <Switch
                          id="workflows"
                          checked={settings.menuVisibility.workflows}
                          onCheckedChange={(checked) => handleMenuVisibilityChange("workflows", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="subscriptions">Subscriptions</Label>
                        <Switch
                          id="subscriptions"
                          checked={settings.menuVisibility.subscriptions}
                          onCheckedChange={(checked) => handleMenuVisibilityChange("subscriptions", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="training">Training & Help</Label>
                        <Switch
                          id="training"
                          checked={settings.menuVisibility.training}
                          onCheckedChange={(checked) => handleMenuVisibilityChange("training", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full md:w-auto md:ml-auto"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> {t.buttons.save}</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}