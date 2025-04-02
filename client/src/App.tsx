import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
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
import Intelligence from "@/pages/intelligence";
import Workflows from "@/pages/workflows";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/simple-contacts" component={SimpleContacts} />
        <Route path="/accounts" component={Accounts} />
        <Route path="/leads" component={Leads} />
        <Route path="/opportunities" component={Opportunities} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/reports" component={Reports} />
        <Route path="/intelligence" component={Intelligence} />
        <Route path="/workflows" component={Workflows} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
