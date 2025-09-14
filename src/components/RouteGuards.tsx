import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserContext } from "@/context/user-role";

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useUserContext();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

export const RequireRole = ({ role, children }: { role: 'patient' | 'doctor'; children: ReactNode }) => {
  const { userRole } = useUserContext();
  const location = useLocation();
  if (userRole !== role) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};
