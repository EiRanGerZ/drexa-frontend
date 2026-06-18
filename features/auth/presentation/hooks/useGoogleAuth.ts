import { useState, useCallback } from "react";
import { api } from "@/lib/api";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  provider: "google";
}

type AuthStatus = "idle" | "loading" | "success" | "error";

interface UseGoogleAuthReturn {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  isLoading: boolean;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
}

// Google OAuth was handled by Firebase. The gateway now uses email + password only
// and has no OAuth endpoint, so this provider is unavailable until one is added.
export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback(async (): Promise<boolean> => {
    setError("Google sign-in is unavailable — please sign in with email and password.");
    setStatus("error");
    return false;
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => {});
    setUser(null);
    setStatus("idle");
    setError(null);
  }, []);

  return { status, user, error, isLoading: status === "loading", login, logout };
};
