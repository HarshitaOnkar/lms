import { create } from "zustand";

import { apiFetch, setAccessToken } from "../lib/api";

type User = { id: number; email: string; name: string };

type AuthState = {
  user: User | null;
  bootstrapped: boolean;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const ACCESS_TOKEN_KEY = "lms_access_token";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  bootstrapped: false,

  bootstrap: async () => {
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    setAccessToken(token);

    if (!token) {
      set({ user: null, bootstrapped: true });
      return;
    }

    try {
      const res = await apiFetch("/api/users/me", { method: "GET", auth: true });
      if (!res.ok) {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        setAccessToken(null);
        set({ user: null, bootstrapped: true });
        return;
      }

      const user = (await res.json()) as User;
      set({ user, bootstrapped: true });
    } catch {
      // API unreachable or other network error — clear stale token
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      setAccessToken(null);
      set({ user: null, bootstrapped: true });
    }
  },

  login: async (email, password) => {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      auth: false,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      if (res.status === 401) {
        throw new Error(
          "Invalid email or password — or no account exists yet. Register first, then sign in."
        );
      }
      throw new Error(body?.message ?? "Login failed");
    }

    const data = (await res.json()) as { user: User; access_token: string };
    window.localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    setAccessToken(data.access_token);
    set({ user: data.user, bootstrapped: true });
  },

  register: async (name, email, password) => {
    const res = await apiFetch("/api/auth/register", {
      method: "POST",
      auth: false,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { message?: string; details?: unknown } | null;
      throw new Error(body?.message ?? "Registration failed");
    }

    await res.json() as { user: User };
    // No session until login
  },

  logout: async () => {
    await apiFetch("/api/auth/logout", { method: "POST", auth: true });
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    setAccessToken(null);
    set({ user: null });
  }
}));
