import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

import { AppSidebar } from "@/components/AppSidebar";
import { NotificationPanel } from "@/components/NotificationPanel";
import { UserAvatar } from "@/components/UserAvatar";
import { DraggableBotAssistant } from "@/components/DraggableBotAssistant";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppointmentsPage from "./pages/AppointmentsPage";
import DocumentsPage from "./pages/DocumentsPage";
import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import RoleSelection from "./components/RoleSelection";
import VideoPage from "./pages/VideoPage";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient();

type AppState = 'role-selection' | 'auth' | 'dashboard';

const App = () => {
  const [currentState, setCurrentState] = useState<AppState>('role-selection');
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    setCurrentState('role-selection');
  };

  if (currentState === 'role-selection') {
    return (
      <ThemeProvider defaultTheme="light" storageKey="telemed-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RoleSelection onRoleSelect={handleRoleSelection} />
        </TooltipProvider>
      </ThemeProvider>
    );
  }

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
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              {isAuthenticated && <AppSidebar />}
              <div className="flex-1 flex flex-col">
                {isAuthenticated && (
                  <header className="h-12 flex items-center justify-between border-b px-4">
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
                  <Route path="/" element={<Index />} />
                  <Route path="/appointments" element={<AppointmentsPage />} />
                  <Route path="/documents" element={<DocumentsPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/video" element={<VideoPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </main>
              </div>
            </div>
            {isAuthenticated && <DraggableBotAssistant />}
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
};

export default App;
