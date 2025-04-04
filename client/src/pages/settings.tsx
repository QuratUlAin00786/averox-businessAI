import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Users, Package2, Settings as SettingsIcon, User, Shield } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'Admin';
  
  const makeAdminMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/make-admin");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Admin Access Granted",
        description: "You now have admin privileges. Please refresh the page to see admin sections.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to grant admin access",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  return (
    <div className="py-6">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-600 sm:text-3xl sm:truncate">
              Settings
            </h2>
          </div>
          <div className="flex mt-4 md:mt-0 md:ml-4">
            <Button>
              <Save className="-ml-1 mr-2 h-5 w-5" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
      
      <div className="px-4 mx-auto mt-6 max-w-7xl sm:px-6 md:px-8">
        {!isAdmin && (
          <div className="mb-6">
            <Card className="border-dashed border-orange-400">
              <CardHeader className="text-orange-600">
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Developer Mode
                </CardTitle>
                <CardDescription>
                  Enable admin access for testing admin features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This feature allows you to grant your current account admin privileges for testing purposes. 
                  In a production environment, this would be managed through proper authorization controls.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="default" 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={() => makeAdminMutation.mutate()}
                  disabled={makeAdminMutation.isPending}
                >
                  {makeAdminMutation.isPending ? "Processing..." : "Make Me an Admin"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Manage your personal profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Update your name, email, password, and other personal details
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/settings/profile">
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="w-5 h-5 mr-2" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure general system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage notifications, display preferences, and other system settings
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/settings/system">
                <Button variant="outline" className="w-full">
                  Configure
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package2 className="w-5 h-5 mr-2" />
                Subscription
              </CardTitle>
              <CardDescription>
                Manage your subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View your current plan, billing history, and upgrade options
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/subscriptions">
                <Button variant="outline" className="w-full">
                  Manage Subscription
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          {isAdmin && (
            <>
              <Card className="border-primary bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Admin only - Manage all system users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Create, edit, and delete user accounts, assign roles and permissions
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/admin/users">
                    <Button className="w-full">
                      Manage Users
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card className="border-primary bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package2 className="w-5 h-5 mr-2" />
                    Subscription Packages
                  </CardTitle>
                  <CardDescription>
                    Admin only - Manage subscription packages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Create and configure subscription plans and pricing
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/admin/subscription-packages">
                    <Button className="w-full">
                      Manage Packages
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
