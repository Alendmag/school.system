import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/context/AppContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { CommandPalette } from "@/components/CommandPalette";
import Dashboard from "@/pages/Dashboard";
import Students from "@/pages/Students";
import StudentsGrid from "@/pages/StudentsGrid";
import NotFound from "@/pages/not-found";
import SettingsPage from "@/pages/Settings";

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

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/students" component={StudentsGrid} />
        <Route path="/students-old" component={Students} />
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <WouterRouter>
          <Router />
        </WouterRouter>
        <Toaster />
        <CommandPalette />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
