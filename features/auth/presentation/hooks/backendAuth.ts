import { api } from "@/lib/api";

type BackendAuthResponse = {
  message?: string;
  error?: string;
};

/** Email + password login. The gateway sets HttpOnly session cookies on success. */
export async function loginWithBackend(email: string, password: string): Promise<BackendAuthResponse> {
  return api.post<BackendAuthResponse>("/auth/login", { email, password }, { retryOnUnauthorized: false });
}

/** Email + password registration. The gateway creates the account and sets session cookies. */
export async function registerWithBackend(
  email: string,
  password: string,
  username?: string,
): Promise<BackendAuthResponse> {
  return api.post<BackendAuthResponse>("/auth/register", { email, password, username }, { retryOnUnauthorized: false });
}
