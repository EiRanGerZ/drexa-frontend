import { useState, useCallback } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import { auth } from "@/features/core/store/firebase";

type RegisterStatus = "idle" | "loading" | "success" | "error";

interface UseRegisterReturn {
  status: RegisterStatus;
  error: string | null;
  isLoading: boolean;
  register: (email: string, password: string) => Promise<boolean>;
}

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists",
  "auth/invalid-email": "Invalid email address",
  "auth/weak-password": "Password is too weak",
  "auth/operation-not-allowed": "Email/password sign-up is not enabled",
};

export const useRegister = (): UseRegisterReturn => {
  const [status, setStatus] = useState<RegisterStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (email: string, password: string): Promise<boolean> => {
    setStatus("loading");
    setError(null);

    let firebaseUser = null;

    try {
      // Step 1: Firebase creates the user and issues an ID token
      const result = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      // Step 2: Backend verifies the ID token, creates the user record, and sends OTP
      const res = await fetch("http://localhost:8080/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });

      // Done with Firebase session
      await auth.signOut();

      if (!res.ok) {
        // Clean up orphaned Firebase account on backend failure
        await firebaseUser.delete().catch(() => {});
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Registration failed");
      }

      // Store email so the verification page can read it
      localStorage.setItem("pending_email", email);

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

  return { status, error, isLoading: status === "loading", register };
};
