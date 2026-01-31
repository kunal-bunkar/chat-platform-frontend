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
  const res = await api.post<LoginResponse>("/auth/login", { email, password });
  return res.data;
}

export type LogoutResponse = {
  success: boolean;
  message?: string;
};

export async function logout(): Promise<LogoutResponse> {
  const res = await api.post<LogoutResponse>("/auth/logout");
  return res.data;
}

export type RefreshTokenResponse = {
  success: boolean;
  token: string;
  refreshToken?: string;
};

export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
  const res = await api.post<RefreshTokenResponse>("/auth/refresh-token", { refreshToken });
  return res.data;
}

// ---------- Signup flow ----------

export type SignupEmailResponse = {
  success: boolean;
  message: string;
  otpSent: boolean;
};

export async function signupRequestEmail(email: string): Promise<SignupEmailResponse> {
  const res = await api.post<SignupEmailResponse>("/auth/signup/email", { email });
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
  const res = await api.post<VerifyOtpResponse>("/auth/signup/verify-otp", { email, otp });
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
  const res = await api.post<SetPasswordResponse>("/auth/signup/set-password", {
    email,
    password,
    tempToken,
    username,
  });
  return res.data;
}

// ---------- Password Reset Flow ----------

export type ForgotPasswordResponse = {
  success: boolean;
  message: string;
  resetSent: boolean;
};

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const res = await api.post<ForgotPasswordResponse>("/auth/forgot-password", { email });
  return res.data;
}

export type ResetPasswordResponse = {
  success: boolean;
  message: string;
};

export async function resetPassword(
  email: string,
  resetToken: string | null,
  otp: string | null,
  newPassword: string
): Promise<ResetPasswordResponse> {
  const res = await api.post<ResetPasswordResponse>("/auth/reset-password", {
    email,
    resetToken,
    otp,
    newPassword,
  });
  return res.data;
}
