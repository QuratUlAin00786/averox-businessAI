import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { SystemSettingsProvider } from "@/hooks/use-system-settings";
import { NotificationsProvider } from "@/hooks/use-notifications";
import { ProtectedRoute } from "@/lib/protected-route";
import Layout from "@/components/layout/layout";
import Dashboard from "@/pages/dashboard";
import Contacts from "@/pages/contacts";
import SimpleContacts from "@/pages/simple-contacts";
import Accounts from "@/pages/accounts";
import Leads from "@/pages/leads";
import LeadDetail from "@/pages/lead-detail";
import Opportunities from "@/pages/opportunities";
import Calendar from "@/pages/calendar";
import Tasks from "@/pages/tasks";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import SettingsProfile from "@/pages/settings-profile";
import SettingsSystem from "@/pages/settings-system";
import SettingsApiKeys from "@/pages/settings-api-keys";
import SettingsTeams from "@/pages/settings-teams";
import SettingsDataMigration from "@/pages/settings-data-migration";
import SettingsDashboard from "@/pages/settings-dashboard";
import SettingsCustomFields from "@/pages/settings-custom-fields";
import Intelligence from "@/pages/intelligence";
import Workflows from "@/pages/workflows";
import Subscriptions from "@/pages/subscriptions";
import Subscribe from "@/pages/subscribe";
import AdminSubscriptionPackages from "@/pages/admin-subscription-packages";
import AdminUsers from "@/pages/admin-users";
import CommunicationCenter from "@/pages/communication-center";
import Accounting from "@/pages/accounting";
import Inventory from "@/pages/inventory";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import TrainingHelpPage from "@/pages/training-help";
import NewProduct from "@/pages/inventory/products/new";
import NewCategory from "@/pages/inventory/categories/new";
import NewTransaction from "@/pages/inventory/transactions/new";
import NewInvoice from "@/pages/accounting/invoices/new";
import NewPurchaseOrder from "@/pages/accounting/purchase-orders/new";
import RevenueReport from "@/pages/accounting/reports/revenue";
import ExpensesReport from "@/pages/accounting/reports/expenses";
import ProfitLossReport from "@/pages/accounting/reports/profit-loss";
import TransactionsPage from "@/pages/accounting/transactions";
import SupportTickets from "@/pages/support-tickets";
import Ecommerce from "@/pages/ecommerce";
import EcommerceStore from "@/pages/ecommerce-store";
import NotificationsPage from "@/pages/notifications";
import Marketing from "@/pages/marketing";
import MarketingCreate from "@/pages/marketing/create";
import MarketingAutomations from "@/pages/marketing/automations";
import WorkflowBuilder from "@/pages/marketing/workflow-builder";
import SegmentBuilder from "@/pages/marketing/segment-builder";
import EmailTemplateEditor from "@/pages/marketing/email-template-editor";
import Manufacturing from "@/pages/Manufacturing";
import InvoicePayment from "@/pages/InvoicePayment";
import SecurityPage from "@/pages/security";
import SetupWizard from "@/pages/setup-wizard";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <Route path="/setup" component={SetupWizard} />
      
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
      
      <ProtectedRoute path="/leads/:id" component={({ params }: { params: { id: string } }) => (
        <Layout>
          <LeadDetail />
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
      
      <ProtectedRoute path="/subscribe" component={() => (
        <Layout>
          <Subscribe />
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
      
      <ProtectedRoute path="/settings/teams" component={() => (
        <Layout>
          <SettingsTeams />
        </Layout>
      )} />
      
      <ProtectedRoute path="/settings/data-migration" component={() => (
        <Layout>
          <SettingsDataMigration />
        </Layout>
      )} />
      
      <ProtectedRoute path="/settings/dashboard" component={() => (
        <Layout>
          <SettingsDashboard />
        </Layout>
      )} />
      
      <ProtectedRoute path="/settings/custom-fields" component={() => (
        <Layout>
          <SettingsCustomFields />
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
      
      <ProtectedRoute path="/accounting/invoices/new" component={() => (
        <Layout>
          <NewInvoice />
        </Layout>
      )} />
      
      <ProtectedRoute path="/accounting/invoices/:id" component={({ params }: { params: { id: string } }) => (
        <Layout>
          <Accounting subPath={`invoices/${params.id}`} />
        </Layout>
      )} />
      
      <ProtectedRoute path="/accounting/invoices/:id/pay" component={({ params }: { params: { id: string } }) => (
        <Layout>
          <InvoicePayment />
        </Layout>
      )} />
      
      <ProtectedRoute path="/accounting/purchase-orders/new" component={() => (
        <Layout>
          <NewPurchaseOrder />
        </Layout>
      )} />
      
      <ProtectedRoute path="/accounting/purchase-orders/:id" component={({ params }: { params: { id: string } }) => (
        <Layout>
          <Accounting subPath={`purchase-orders/${params.id}`} />
        </Layout>
      )} />
      
      <ProtectedRoute path="/accounting/reports/revenue" component={() => (
        <Layout>
          <RevenueReport />
        </Layout>
      )} />
      
      <ProtectedRoute path="/accounting/reports/expenses" component={() => (
        <Layout>
          <ExpensesReport />
        </Layout>
      )} />
      
      <ProtectedRoute path="/accounting/reports/profit-loss" component={() => (
        <Layout>
          <ProfitLossReport />
        </Layout>
      )} />
      
      <ProtectedRoute path="/accounting/transactions" component={() => (
        <Layout>
          <TransactionsPage />
        </Layout>
      )} />
      
      <ProtectedRoute path="/inventory" component={() => (
        <Layout>
          <Inventory />
        </Layout>
      )} />
      
      <ProtectedRoute path="/inventory/categories/new" component={() => (
        <Layout>
          <NewCategory />
        </Layout>
      )} />
      
      <ProtectedRoute path="/inventory/categories/:id" component={({ params }: { params: { id: string } }) => (
        <Layout>
          <Inventory subPath={`categories/${params.id}`} />
        </Layout>
      )} />
      
      <ProtectedRoute path="/inventory/products/new" component={() => (
        <Layout>
          <NewProduct />
        </Layout>
      )} />
      
      <ProtectedRoute path="/inventory/products/:id" component={({ params }: { params: { id: string } }) => (
        <Layout>
          <Inventory subPath={`products/${params.id}`} />
        </Layout>
      )} />
      
      <ProtectedRoute path="/inventory/products/:id/edit" component={({ params }: { params: { id: string } }) => (
        <Layout>
          <Inventory subPath={`products/${params.id}/edit`} />
        </Layout>
      )} />
      
      <ProtectedRoute path="/inventory/products/:id/history" component={({ params }: { params: { id: string } }) => (
        <Layout>
          <Inventory subPath={`products/${params.id}/history`} />
        </Layout>
      )} />
      
      <ProtectedRoute path="/inventory/transactions/new" component={() => (
        <Layout>
          <NewTransaction />
        </Layout>
      )} />
      
      <ProtectedRoute path="/training-help" component={() => (
        <Layout>
          <TrainingHelpPage />
        </Layout>
      )} />
      
      <ProtectedRoute path="/support-tickets" component={() => (
        <Layout>
          <SupportTickets />
        </Layout>
      )} />
      
      <ProtectedRoute path="/ecommerce" component={() => (
        <Layout>
          <Ecommerce />
        </Layout>
      )} />
      
      <ProtectedRoute path="/ecommerce-store" component={() => (
        <Layout>
          <EcommerceStore />
        </Layout>
      )} />
      
      <ProtectedRoute path="/notifications" component={() => (
        <Layout>
          <NotificationsPage />
        </Layout>
      )} />
      
      <ProtectedRoute path="/marketing" component={() => (
        <Layout>
          <Marketing />
        </Layout>
      )} />
      
      <ProtectedRoute path="/marketing/create" component={() => (
        <Layout>
          <MarketingCreate />
        </Layout>
      )} />
      
      <ProtectedRoute path="/marketing/automations" component={() => (
        <Layout>
          <MarketingAutomations />
        </Layout>
      )} />
      
      <ProtectedRoute path="/marketing/workflow-builder" component={() => (
        <Layout>
          <WorkflowBuilder />
        </Layout>
      )} />
      
      <ProtectedRoute path="/marketing/segment-builder" component={() => (
        <Layout>
          <SegmentBuilder />
        </Layout>
      )} />
      
      <ProtectedRoute path="/marketing/email-template-editor" component={() => (
        <Layout>
          <EmailTemplateEditor />
        </Layout>
      )} />
      
      <ProtectedRoute path="/manufacturing" component={() => (
        <Layout>
          <Manufacturing />
        </Layout>
      )} />
      
      <ProtectedRoute path="/manufacturing/:subPath" component={({ params }: { params: { subPath: string } }) => (
        <Layout>
          <Manufacturing subPath={params.subPath} />
        </Layout>
      )} />
      
      <ProtectedRoute path="/manufacturing/:parentPath/:childPath" component={({ params }: { params: { parentPath: string, childPath: string } }) => (
        <Layout>
          <Manufacturing subPath={`${params.parentPath}/${params.childPath}`} />
        </Layout>
      )} />
      
      <ProtectedRoute path="/security" component={() => (
        <Layout>
          <SecurityPage />
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
        <LanguageProvider>
          <SystemSettingsProvider>
            <NotificationsProvider>
              <Router />
              <Toaster />
            </NotificationsProvider>
          </SystemSettingsProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
