"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ROLE_STORAGE_KEY, type Role } from "@/types/role";

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  clearRole: () => void;
  isAdmin: boolean;
  isMurid: boolean;
  hasRole: boolean;
}

const RoleContext = createContext<RoleContextValue | null>(null);

function getStoredRole(): Role {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(ROLE_STORAGE_KEY);
  if (stored === "admin" || stored === "murid") {
    return stored;
  }
  return null;
}

export function RoleProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [role, setRoleState] = useState<Role>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = getStoredRole();
    setRoleState(stored);
    if (stored) {
      document.cookie = `sk_quiz_peranan=${stored}; path=/; max-age=86400; SameSite=Lax`;
    }
    setIsHydrated(true);
  }, []);

  const setRole = useCallback((newRole: Role) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem(ROLE_STORAGE_KEY, newRole);
      document.cookie = `sk_quiz_peranan=${newRole}; path=/; max-age=86400; SameSite=Lax`;
    } else {
      localStorage.removeItem(ROLE_STORAGE_KEY);
      document.cookie =
        "sk_quiz_peranan=; path=/; max-age=0; SameSite=Lax";
    }
  }, []);

  const clearRole = useCallback(() => {
    setRole(null);
  }, [setRole]);

  if (!isHydrated) {
    return null;
  }

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        clearRole,
        isAdmin: role === "admin",
        isMurid: role === "murid",
        hasRole: role !== null,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole mesti digunakan dalam RoleProvider");
  }
  return context;
}
