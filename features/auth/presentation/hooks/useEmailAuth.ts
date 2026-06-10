import { useState, useCallback } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import { auth } from "@/features/core/store/firebase";
import { api } from "@/lib/api";

type AuthStatus = "idle" | "loading" | "success" | "error";

interface UseEmailAuthReturn {
  status: AuthStatus;
  error: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/user-not-found": "Invalid email or password",
  "auth/wrong-password": "Invalid email or password",
  "auth/invalid-credential": "Invalid email or password",
  "auth/invalid-email": "Invalid email address",
  "auth/user-disabled": "This account has been disabled",
  "auth/too-many-requests": "Too many attempts. Please try again later",
};

export const useEmailAuth = (): UseEmailAuthReturn => {
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setStatus("loading");
    setError(null);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();
      await auth.signOut();

      await api.post("/auth/signin", { id_token: idToken });

      setStatus("success");
      return true;
    } catch (err: unknown) {
      await auth.signOut().catch(() => {});

      const firebaseErr = err as FirebaseError;
      const message =
        FIREBASE_ERRORS[firebaseErr?.code] ??
        (err instanceof Error ? err.message : "Something went wrong");

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
