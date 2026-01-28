// Client-side authentication service

import { api } from "../config/api";

export type AuthUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  authProvider: string;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  success: boolean;
  user: AuthUser;
  token: string;
  refreshToken: string;
  message?: string;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/api/auth/login", { email, password });
  return res.data;
}

export type LogoutResponse = {
  success: boolean;
  message?: string;
};

export async function logout(): Promise<LogoutResponse> {
  const res = await api.post<LogoutResponse>("/api/auth/logout");
  return res.data;
}

// ---------- Signup flow ----------

export type SignupEmailResponse = {
  success: boolean;
  message: string;
  otpSent: boolean;
};

export async function signupRequestEmail(email: string): Promise<SignupEmailResponse> {
  const res = await api.post<SignupEmailResponse>("/api/auth/signup/email", { email });
  return res.data;
}

export type VerifyOtpResponse = {
  success: boolean;
  verified: boolean;
  tempToken?: string;
  attemptsRemaining?: number;
  message?: string;
};

export async function signupVerifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
  const res = await api.post<VerifyOtpResponse>("/api/auth/signup/verify-otp", { email, otp });
  return res.data;
}

export type SetPasswordResponse = {
  success: boolean;
  user: AuthUser & { username?: string };
  token: string;
  refreshToken: string;
};

export async function signupSetPassword(
  email: string,
  password: string,
  tempToken: string,
  username: string
): Promise<SetPasswordResponse> {
  const res = await api.post<SetPasswordResponse>("/api/auth/signup/set-password", {
    email,
    password,
    tempToken,
    username,
  });
  return res.data;
}
