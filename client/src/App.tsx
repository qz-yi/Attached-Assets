import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";

// Pages
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import AdminDashboard from "@/pages/admin-dashboard";
import EmployerDashboard from "@/pages/employer-dashboard";
import ClientDashboard from "@/pages/client-dashboard";
import ClientProfile from "@/pages/client-profile";
import { Loader2 } from "lucide-react";

function ProtectedRouter() {
  const { data: user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Dashboard routing based on role
  const getHomeComponent = () => {
    switch (user.role) {
      case 'admin': return AdminDashboard;
      case 'employer': return EmployerDashboard;
      case 'client': return ClientDashboard;
      default: return AuthPage;
    }
  };

  return (
    <Layout>
      <Switch>
        <Route path="/" component={getHomeComponent()} />
        
        {/* Role Specific Routes */}
        {user.role === 'admin' && (
          <Route path="/admin/users" component={AdminDashboard} />
        )}
        
        {user.role === 'employer' && (
          <Route path="/employer/create" component={EmployerDashboard} />
        )}
        
        {user.role === 'client' && (
          <Route path="/client/profile" component={ClientProfile} />
        )}

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ProtectedRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
