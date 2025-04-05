import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Layout from "@/components/layout/layout";
import Dashboard from "@/pages/dashboard";
import Contacts from "@/pages/contacts";
import SimpleContacts from "@/pages/simple-contacts";
import Accounts from "@/pages/accounts";
import Leads from "@/pages/leads";
import Opportunities from "@/pages/opportunities";
import Calendar from "@/pages/calendar";
import Tasks from "@/pages/tasks";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import SettingsProfile from "@/pages/settings-profile";
import SettingsSystem from "@/pages/settings-system";
import SettingsApiKeys from "@/pages/settings-api-keys";
import Intelligence from "@/pages/intelligence";
import Workflows from "@/pages/workflows";
import Subscriptions from "@/pages/subscriptions";
import AdminSubscriptionPackages from "@/pages/admin-subscription-packages";
import AdminUsers from "@/pages/admin-users";
import CommunicationCenter from "@/pages/communication-center";
import Accounting from "@/pages/accounting";
import Inventory from "@/pages/inventory";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <ProtectedRoute path="/" component={() => (
        <Layout>
          <Dashboard />
        </Layout>
      )} />
      
      <ProtectedRoute path="/contacts" component={() => (
        <Layout>
          <Contacts />
        </Layout>
      )} />
      
      <ProtectedRoute path="/simple-contacts" component={() => (
        <Layout>
          <SimpleContacts />
        </Layout>
      )} />
      
      <ProtectedRoute path="/accounts" component={() => (
        <Layout>
          <Accounts />
        </Layout>
      )} />
      
      <ProtectedRoute path="/leads" component={() => (
        <Layout>
          <Leads />
        </Layout>
      )} />
      
      <ProtectedRoute path="/opportunities" component={() => (
        <Layout>
          <Opportunities />
        </Layout>
      )} />
      
      <ProtectedRoute path="/calendar" component={() => (
        <Layout>
          <Calendar />
        </Layout>
      )} />
      
      <ProtectedRoute path="/tasks" component={() => (
        <Layout>
          <Tasks />
        </Layout>
      )} />
      
      <ProtectedRoute path="/reports" component={() => (
        <Layout>
          <Reports />
        </Layout>
      )} />
      
      <ProtectedRoute path="/intelligence" component={() => (
        <Layout>
          <Intelligence />
        </Layout>
      )} />
      
      <ProtectedRoute path="/workflows" component={() => (
        <Layout>
          <Workflows />
        </Layout>
      )} />
      
      <ProtectedRoute path="/subscriptions" component={() => (
        <Layout>
          <Subscriptions />
        </Layout>
      )} />
      
      <ProtectedRoute path="/settings" component={() => (
        <Layout>
          <Settings />
        </Layout>
      )} />
      
      <ProtectedRoute path="/settings/profile" component={() => (
        <Layout>
          <SettingsProfile />
        </Layout>
      )} />
      
      <ProtectedRoute path="/settings/system" component={() => (
        <Layout>
          <SettingsSystem />
        </Layout>
      )} />
      
      <ProtectedRoute path="/settings/api-keys" component={() => (
        <Layout>
          <SettingsApiKeys />
        </Layout>
      )} />
      
      <ProtectedRoute path="/admin/subscription-packages" component={() => (
        <Layout>
          <AdminSubscriptionPackages />
        </Layout>
      )} />
      
      <ProtectedRoute path="/admin/users" component={() => (
        <Layout>
          <AdminUsers />
        </Layout>
      )} />
      
      <ProtectedRoute path="/communication-center" component={() => (
        <Layout>
          <CommunicationCenter />
        </Layout>
      )} />
      
      <ProtectedRoute path="/accounting" component={() => (
        <Layout>
          <Accounting />
        </Layout>
      )} />
      
      <ProtectedRoute path="/inventory" component={() => (
        <Layout>
          <Inventory />
        </Layout>
      )} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
