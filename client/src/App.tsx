import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Home from "@/pages/home";
import Demo from "@/pages/demo";
import Admin from "@/pages/admin";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import Dashboard from "@/pages/new-dashboard";
import Website from "@/pages/website";
import Inventory from "@/pages/inventory";
import Leads from "@/pages/leads";
import Settings from "@/pages/settings";
import Billing from "@/pages/billing";
import BusinessDetails from "@/pages/business-details";
import AddVehicle from "@/pages/add-vehicle";
import UploadLogo from "@/pages/upload-logo";
import CustomizeHomepage from "@/pages/customize-homepage";
import PublicDealership from "@/pages/public-dealership";
import PublicInventory from "@/pages/public-inventory";
import PublicVehicleDetail from "@/pages/public-vehicle-detail";
import NotFound from "@/pages/not-found";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="flex items-center gap-2 border-b px-4 py-3">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex-1" />
          </header>
          <main className="flex-1 overflow-auto bg-gradient-to-br from-primary/5 via-background to-primary-purple/5">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function AuthenticatedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <AuthenticatedLayout>
      <Component />
    </AuthenticatedLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/demo" component={Demo} />
      <Route path="/admin" component={Admin} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard">
        {() => <AuthenticatedRoute component={Dashboard} />}
      </Route>
      <Route path="/website">
        {() => <AuthenticatedRoute component={Website} />}
      </Route>
      <Route path="/inventory">
        {() => <AuthenticatedRoute component={Inventory} />}
      </Route>
      <Route path="/leads">
        {() => <AuthenticatedRoute component={Leads} />}
      </Route>
      <Route path="/settings">
        {() => <AuthenticatedRoute component={Settings} />}
      </Route>
      <Route path="/billing">
        {() => <AuthenticatedRoute component={Billing} />}
      </Route>
      <Route path="/business-details">
        {() => <AuthenticatedRoute component={BusinessDetails} />}
      </Route>
      <Route path="/customize-homepage">
        {() => <AuthenticatedRoute component={CustomizeHomepage} />}
      </Route>
      <Route path="/add-vehicle">
        {() => <AuthenticatedRoute component={AddVehicle} />}
      </Route>
      <Route path="/upload-logo">
        {() => <AuthenticatedRoute component={UploadLogo} />}
      </Route>
      <Route path="/:slug/vehicles/:id" component={PublicVehicleDetail} />
      <Route path="/:slug/inventory" component={PublicInventory} />
      <Route path="/:slug" component={PublicDealership} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
