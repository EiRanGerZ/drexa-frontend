import { useState, useCallback } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import { auth } from "@/features/core/store/firebase";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

type AuthStatus = "idle" | "loading" | "success" | "error";

interface UseEmailAuthReturn {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthSession | null>;
  logout: () => void;
}

const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<AuthSession | null> => {
    setStatus("loading");
    setError(null);

    try {
      // Step 1: Firebase verifies credentials and issues an ID token
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();

      // Step 2: Our backend verifies the ID token and returns a JWT
      const res = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });

      // Done with Firebase — kill the session regardless of backend result
      await auth.signOut();

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Authentication failed");
      }

      const session: AuthSession = await res.json();

      localStorage.setItem(TOKEN_KEY, session.accessToken);
      localStorage.setItem(REFRESH_KEY, session.refreshToken);

      setUser(session.user);
      setStatus("success");
      return session;

    } catch (err: unknown) {
      await auth.signOut().catch(() => {});

      const firebaseErr = err as FirebaseError;
      const message =
        FIREBASE_ERRORS[firebaseErr?.code] ??
        (err instanceof Error ? err.message : "Something went wrong");

      setError(message);
      setStatus("error");
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
    setStatus("idle");
    setError(null);
  }, []);

  return { status, user, error, isLoading: status === "loading", login, logout };
};
