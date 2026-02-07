// Application constants

function normalizeApiBaseUrl(raw: string | undefined): string {
  // Default to localhost:5000 for development
  const defaultUrl = "http://localhost:5000";
  const base = (raw?.trim() || defaultUrl).replace(/\/+$/, "");
  // Ensure it ends with /api
  return base.endsWith("/api") ? base : `${base}/api`;
}

// Base URL for all HTTP API calls (should include `/api`)
// Set REACT_APP_API_URL in .env file (e.g., REACT_APP_API_URL=http://localhost:5000)
export const API_BASE_URL = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);

// Socket.IO URL (base URL without /api)
// Socket.IO automatically handles ws:// vs wss:// based on http:// vs https://
export const SOCKET_URL = (() => {
  // Get the raw API URL from env (before normalization)
  const rawUrl = process.env.REACT_APP_API_URL?.trim() || "http://localhost:5000";
  
  // Remove trailing slashes and /api if present
  let socketUrl = rawUrl.replace(/\/+$/, "").replace(/\/api$/, "");
  
  // Validate URL format - must start with http:// or https://
  if (!socketUrl.startsWith("http://") && !socketUrl.startsWith("https://")) {
    console.warn(`Invalid Socket URL format: ${socketUrl}, using default`);
    return "http://localhost:5000";
  }
  
  // Validate it's a proper URL
  try {
    const url = new URL(socketUrl);
    // Return the full URL (Socket.IO will handle ws:// vs wss:// automatically)
    return url.origin;
  } catch (error) {
    console.warn(`Invalid Socket URL: ${socketUrl}, using default. Error:`, error);
    return "http://localhost:5000";
  }
})();

export const STORAGE_KEYS = {
  accessToken: "chat.accessToken",
  refreshToken: "chat.refreshToken",
  user: "chat.user",
} as const;