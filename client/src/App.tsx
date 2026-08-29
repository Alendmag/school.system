import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { CommandPalette } from "@/components/CommandPalette";
import Dashboard from "@/pages/Dashboard";
import Students from "@/pages/Students";
import NotFound from "@/pages/not-found";
import SettingsPage from "@/pages/Settings";
import Login from "@/pages/Login";

import Teachers from "@/pages/Teachers";
import Academics from "@/pages/Academics";
import Finance from "@/pages/Finance";

import Homework from "@/pages/Homework";
import Messages from "@/pages/Messages";
import Reports from "@/pages/Reports";

import Schedule from "@/pages/Schedule";
import Library from "@/pages/Library";
import Transport from "@/pages/Transport";
import Security from "@/pages/Security";
import Health from "@/pages/Health";
import Maintenance from "@/pages/Maintenance";
import Grades from "@/pages/Grades";

import { Loader as Loader2 } from "lucide-react";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/students" component={Students} />
        <Route path="/teachers" component={Teachers} />
        <Route path="/academics" component={Academics} />
        <Route path="/finance" component={Finance} />
        <Route path="/homework" component={Homework} />
        <Route path="/messages" component={Messages} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={SettingsPage} />
        
        <Route path="/schedule" component={Schedule} />
        <Route path="/grades" component={Grades} />
        <Route path="/library" component={Library} />
        <Route path="/transport" component={Transport} />
        <Route path="/security" component={Security} />
        <Route path="/health" component={Health} />
        <Route path="/maintenance" component={Maintenance} />
        
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function AuthGate() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600 mx-auto" />
          <p className="text-muted-foreground">جاري تحميل النظام...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <AppProvider>
      <Router />
      <CommandPalette />
    </AppProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter>
          <AuthGate />
        </WouterRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
