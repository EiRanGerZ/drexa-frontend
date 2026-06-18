import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { loginWithBackend } from "./backendAuth";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

interface AuthSession {
  message: string;
  user: AuthUser;
}

type AuthStatus = "idle" | "loading" | "success" | "error";

interface UseEmailAuthReturn {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthSession | null>;
  logout: () => Promise<void>;
}

export const useEmailAuth = (): UseEmailAuthReturn => {
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<AuthSession | null> => {
    setStatus("loading");
    setError(null);

    try {
      // The gateway verifies credentials and sets HttpOnly cookies — no token handling here.
      const res = await loginWithBackend(email, password);

      const session: AuthSession = {
        message: res.message ?? "login successful",
        user: { id: "", email, name: "", avatar: "" },
      };

      setUser(session.user);
      setStatus("success");
      return session;
    } catch (err: unknown) {
      // The api client throws an Error whose message is the gateway's `error` field
      // (e.g. "invalid email or password", "too many attempts, please try again later").
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setStatus("error");
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => {});
    setUser(null);
    setStatus("idle");
    setError(null);
  }, []);

  return { status, user, error, isLoading: status === "loading", login, logout };
};
