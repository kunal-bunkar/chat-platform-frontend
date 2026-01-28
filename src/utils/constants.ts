// Application constants

export const API_BASE_URL =
  process.env.REACT_APP_API_URL?.trim() || "http://localhost:8081";

export const STORAGE_KEYS = {
  accessToken: "chat.accessToken",
  refreshToken: "chat.refreshToken",
  user: "chat.user",
} as const;