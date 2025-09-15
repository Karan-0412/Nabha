import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

import { AppSidebar } from "@/components/AppSidebar";
import { NotificationPanel } from "@/components/NotificationPanel";
import { UserAvatar } from "@/components/UserAvatar";
import { DraggableBotAssistant } from "@/components/DraggableBotAssistant";
import NotFound from "./pages/NotFound";
import AppointmentsPage from "./pages/AppointmentsPage";
import DocumentsPage from "./pages/DocumentsPage";
import AuthPage from "./pages/AuthPage";
import RoleSelection from "./components/RoleSelection";
import VideoPage from "./pages/VideoPage";
import DashboardPage from "./pages/DashboardPage";
import { RequireAuth } from "@/components/RouteGuards";
import SettingsPage from "./pages/SettingsPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import { UserContext, UserRole } from "./context/user-role";
import NotificationsAgent from "@/components/NotificationsAgent";
import NewNotificationPopup from "@/components/NewNotificationPopup";
import "@/utils/testAI"; // Test AI connection on app load

const queryClient = new QueryClient();

type AppState = 'role-selection' | 'auth' | 'dashboard';

const AUTH_KEY = 'tm-auth';
const ROLE_KEY = 'tm-role';

const App = () => {
  const [currentState, setCurrentState] = useState<AppState>('role-selection');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load persisted auth on mount
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_KEY);
      const savedRole = localStorage.getItem(ROLE_KEY) as UserRole | null;
      if (savedAuth === '1') {
        setIsAuthenticated(true);
        if (savedRole === 'patient' || savedRole === 'doctor') setUserRole(savedRole);
        setCurrentState('dashboard');
      }
    } catch {}
  }, []);

  // Persist changes
  useEffect(() => {
    try { localStorage.setItem(AUTH_KEY, isAuthenticated ? '1' : '0'); } catch {}
  }, [isAuthenticated]);
  useEffect(() => {
    try {
      if (userRole) localStorage.setItem(ROLE_KEY, userRole);
      else localStorage.removeItem(ROLE_KEY);
    } catch {}
  }, [userRole]);

  const handleRoleSelection = (role: 'patient' | 'doctor') => {
    setUserRole(role);
    setCurrentState('auth');
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setCurrentState('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    try { localStorage.setItem(AUTH_KEY, '0'); localStorage.removeItem(ROLE_KEY); } catch {}
    setCurrentState('role-selection');
  };

  if (currentState === 'auth') {
    return (
      <ThemeProvider defaultTheme="light" storageKey="telemed-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        </TooltipProvider>
      </ThemeProvider>
    );
  }

  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="telemed-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <UserContext.Provider value={{ userRole, setUserRole, isAuthenticated, setIsAuthenticated }}>
          <BrowserRouter>
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                {isAuthenticated && <AppSidebar />}
                <div className="flex-1 flex flex-col">
                  {isAuthenticated && (
                    <header className="h-12 flex items-center justify-between px-4">
                      <SidebarTrigger />
                      <div className="flex items-center space-x-2">
                        <NotificationPanel />
                        <UserAvatar
                          user={{ name: userRole === 'patient' ? 'Patient User' : 'Dr. Smith' }}
                          onLogout={handleLogout}
                        />
                      </div>
                    </header>
                  )}
                  <main className="flex-1">
                  <Routes>
                    <Route path="/" element={isAuthenticated ? (userRole ? <Navigate to="/dashboard" replace /> : <RoleSelection onRoleSelect={handleRoleSelection} />) : <RoleSelection onRoleSelect={handleRoleSelection} />} />
                    <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
                    <Route path="/appointments" element={<RequireAuth><AppointmentsPage /></RequireAuth>} />
                    <Route path="/documents" element={<RequireAuth><DocumentsPage /></RequireAuth>} />
                    <Route path="/ai-assistant" element={<RequireAuth><AIAssistantPage /></RequireAuth>} />
                    <Route path="/video" element={<RequireAuth><VideoPage /></RequireAuth>} />
                    <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
                    <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </main>
                </div>
              </div>
              {isAuthenticated && <DraggableBotAssistant />}
              {isAuthenticated && <NotificationsAgent />}
              {isAuthenticated && <NewNotificationPopup />}
            </SidebarProvider>
          </BrowserRouter>
        </UserContext.Provider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
};

export default App;
