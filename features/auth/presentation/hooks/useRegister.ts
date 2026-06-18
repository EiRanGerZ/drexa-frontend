import { useState, useCallback } from "react";
import { registerWithBackend } from "./backendAuth";

type RegisterStatus = "idle" | "loading" | "success" | "error";

interface UseRegisterReturn {
  status: RegisterStatus;
  error: string | null;
  isLoading: boolean;
  register: (email: string, password: string, username?: string) => Promise<boolean>;
}

export const useRegister = (): UseRegisterReturn => {
  const [status, setStatus] = useState<RegisterStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (email: string, password: string, username?: string): Promise<boolean> => {
    setStatus("loading");
    setError(null);

    try {
      // The gateway creates the account and sets HttpOnly session cookies.
      await registerWithBackend(email, password, username);

      // The OTP / verification step reads the pending email from localStorage.
      localStorage.setItem("pending_email", email);

      setStatus("success");
      return true;
    } catch (err: unknown) {
      // Gateway error messages: "email already registered", "password must be at least 8 characters", etc.
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setStatus("error");
      return false;
    }
  }, []);

  return { status, error, isLoading: status === "loading", register };
};
