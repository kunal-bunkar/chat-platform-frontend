// Application constants

function normalizeApiBaseUrl(raw: string | undefined): string {
  const base = (raw?.trim() || "http://localhost:8081").replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

// Base URL for all HTTP API calls (should include `/api`)
export const API_BASE_URL = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);

export const STORAGE_KEYS = {
  accessToken: "chat.accessToken",
  refreshToken: "chat.refreshToken",
  user: "chat.user",
} as const;