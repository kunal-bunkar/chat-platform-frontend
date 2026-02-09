// Forgot Password component
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import * as authService from "../../services/authService";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await authService.forgotPassword(email);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message || "Failed to send reset instructions");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        (err && typeof err === "object" && "message" in err ? String(err.message) : "Failed to send reset instructions");
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
                <p className="text-sm text-slate-600">Enter your email to receive reset instructions.</p>
              </div>
            </div>

            {success ? (
              <div className="mt-6 space-y-4">
                <div
                  className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-xl px-3.5 py-2.5"
                  role="alert"
                >
                  <p className="font-semibold mb-1">Reset instructions sent!</p>
                  <p>
                    If an account with <strong>{email}</strong> exists, you will receive an email with:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>A password reset link with a token</li>
                    <li>A 6-digit OTP code</li>
                  </ul>
                  <p className="mt-3 text-xs">
                    You can use either the reset link or the OTP code to reset your password.
                  </p>
                </div>

                <div className="space-y-3">
                  <Link
                    to={`/reset-password?email=${encodeURIComponent(email)}`}
                    className="btn btn-primary w-full"
                  >
                    Continue to Reset Password
                  </Link>
                  <Link to="/login" className="btn btn-ghost w-full">
                    Back to Login
                  </Link>
                </div>
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
                    disabled={isSubmitting}
                  />
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
                      Sending...
                    </>
                  ) : (
                    "Send Reset Instructions"
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
