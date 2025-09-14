import { createContext, useContext } from "react";

export type UserRole = 'patient' | 'doctor' | null;

export interface UserContextValue {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

export const UserContext = createContext<UserContextValue | undefined>(undefined);

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('UserContext not found');
  return ctx;
};
