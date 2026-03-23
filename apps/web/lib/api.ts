export type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

function getApiBaseUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const fallbackProdApi = "https://lms-api-inky.vercel.app";
  // Browser: same origin (combined Next + Express on one port)
  if (typeof window !== "undefined") {
    // In deployed web apps, fail-safe to hosted API if env var is missing.
    if (
      window.location.hostname.endsWith("vercel.app") &&
      !window.location.hostname.includes("lms-api-inky")
    ) {
      return fallbackProdApi;
    }
    return "";
  }
  // SSR / server: default to this app’s port when env not set
  if (process.env.NODE_ENV === "production") return fallbackProdApi;
  const port = process.env.PORT ?? "3001";
  return `http://127.0.0.1:${port}`;
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
      method: "POST",
      credentials: "include"
    });
  } catch {
    return null;
  }

  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) return null;
  setAccessToken(data.access_token);
  return data.access_token;
}

export async function apiFetch(path: string, opts: ApiFetchOptions = {}) {
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(opts.headers);

  if (opts.auth !== false) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let first: Response;
  try {
    first = await fetch(url, { ...opts, headers, credentials: "include" });
  } catch {
    throw new Error(
      `Cannot reach API at ${base || "(same origin)"}. Run the combined app: npm run dev from the repo root (default port 3001). Set NEXT_PUBLIC_API_BASE_URL only if the API is on another host.`
    );
  }

  if (first.status === 401 && opts.auth !== false) {
    const newToken = await refreshAccessToken();
    if (!newToken) return first;

    const retryHeaders = new Headers(opts.headers);
    retryHeaders.set("Authorization", `Bearer ${newToken}`);
    try {
      return await fetch(url, { ...opts, headers: retryHeaders, credentials: "include" });
    } catch {
      throw new Error(
        `Cannot reach API at ${base || "(same origin)"}. Run npm run dev from the repo root (combined server).`
      );
    }
  }

  return first;
}
