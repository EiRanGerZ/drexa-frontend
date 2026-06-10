import { useState, useCallback } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/features/core/store/firebase";
import { api } from "@/lib/api";

type AuthStatus = "idle" | "loading" | "success" | "error";

interface UseGoogleAuthReturn {
  status: AuthStatus;
  error: string | null;
  isLoading: boolean;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (): Promise<boolean> => {
    setStatus("loading");
    setError(null);

    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      await api.post("/auth/signin", { id_token: idToken });

      await auth.signOut();
      setStatus("success");
      return true;
    } catch (err: unknown) {
      if ((err as { code?: string })?.code === "auth/popup-closed-by-user") {
        setStatus("idle");
        return false;
      }

      const message = err instanceof Error ? err.message : "Unknown error occurred";
      setError(message);
      setStatus("error");
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => {});
    setStatus("idle");
    setError(null);
  }, []);

  return { status, error, isLoading: status === "loading", login, logout };
};
