import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import ApiKeysManagement from "@/components/settings/api-keys-management";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function SettingsApiKeys() {
  const { user } = useAuth();

  // If not admin, redirect to settings
  if (user && user.role !== "Admin") {
    return <Redirect to="/settings" />;
  }

  return (
    <div className="py-6">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h2 className="text-2xl font-bold leading-7 text-neutral-600 sm:text-3xl sm:truncate">
                API Keys Management
              </h2>
            </div>
          </div>

          <ApiKeysManagement />
        </div>
      </div>
    </div>
  );
}