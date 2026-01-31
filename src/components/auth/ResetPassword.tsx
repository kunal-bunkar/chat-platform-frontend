// Reset Password component
import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as authService from "../../services/authService";

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email");
  const tokenFromUrl = searchParams.get("token");

  const [email, setEmail] = useState(emailFromUrl || "");
  const [resetToken, setResetToken] = useState(tokenFromUrl || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [useOtp, setUseOtp] = useState(!tokenFromUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
      setUseOtp(false);
    }
  }, [emailFromUrl, tokenFromUrl]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!useOtp && !resetToken) {
      setError("Reset token is required");
      return;
    }

    if (useOtp && !otp) {
      setError("OTP is required");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authService.resetPassword(
        email,
        useOtp ? null : resetToken,
        useOtp ? otp : null,
        newPassword
      );
      if (result.success) {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      } else {
        setError(result.message || "Failed to reset password");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        (err && typeof err === "object" && "message" in err ? String(err.message) : "Failed to reset password");
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50" />
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="relative min-h-screen grid place-items-center px-4 py-10">
        <div className="w-full max-w-md card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-blue-600 text-white grid place-items-center shadow-sm">
                <span className="text-lg font-bold">C</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold leading-tight">Reset Password</h1>
                <p className="text-sm text-slate-600">Enter your reset token or OTP to set a new password.</p>
              </div>
            </div>

            {success ? (
              <div className="mt-6 space-y-4">
                <div
                  className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-xl px-3.5 py-2.5"
                  role="alert"
                >
                  <p className="font-semibold mb-1">Password reset successfully!</p>
                  <p>Your password has been updated. Redirecting to login...</p>
                </div>
                <Link to="/login" className="btn btn-primary w-full">
                  Go to Login
                </Link>
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                <div className="space-y-1.5">
                  <label className="label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    inputMode="email"
                    disabled={!!emailFromUrl || isSubmitting}
                  />
                </div>

                {/* Toggle between OTP and Reset Token */}
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setUseOtp(true)}
                    className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      useOtp
                        ? "bg-blue-600 text-white"
                        : "bg-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Use OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseOtp(false)}
                    className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      !useOtp
                        ? "bg-blue-600 text-white"
                        : "bg-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Use Reset Token
                  </button>
                </div>

                {useOtp ? (
                  <div className="space-y-1.5">
                    <label className="label" htmlFor="otp">
                      OTP Code
                    </label>
                    <input
                      id="otp"
                      className="input"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      inputMode="numeric"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-slate-500">Enter the 6-digit code sent to your email</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="label" htmlFor="resetToken">
                      Reset Token
                    </label>
                    <input
                      id="resetToken"
                      className="input"
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Enter reset token from email"
                      required
                      disabled={!!tokenFromUrl || isSubmitting}
                    />
                    <p className="text-xs text-slate-500">Enter the reset token from your email link</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="label" htmlFor="newPassword">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      className="input pr-10"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      autoComplete="new-password"
                      minLength={8}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">Must be at least 8 characters long</p>
                </div>

                <div className="space-y-1.5">
                  <label className="label" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      className="input pr-10"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      autoComplete="new-password"
                      minLength={8}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {error ? (
                  <div
                    className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5"
                    role="alert"
                    aria-live="polite"
                  >
                    {error}
                  </div>
                ) : null}

                <button className="btn btn-primary w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5">
                  <span>Remember your password?</span>
                  <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                    Sign in
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
