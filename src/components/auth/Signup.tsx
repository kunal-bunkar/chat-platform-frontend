import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  signupRequestEmail,
  signupVerifyOtp,
  signupSetPassword,
} from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

type Step = "email" | "otp" | "password";

export function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    try {
      const res = await signupRequestEmail(email);
      if (res.otpSent) {
        setInfo("We sent a 6‑digit code to your email. Enter it below.");
        setStep("otp");
      }
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err ? String((err as any).message) : "Failed to send OTP";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    try {
      const res = await signupVerifyOtp(email, otp);
      if (res.verified && res.tempToken) {
        setTempToken(res.tempToken);
        setInfo("OTP verified — now choose your username and password.");
        setStep("password");
      } else {
        setError("OTP verification failed. Please try again.");
      }
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err ? String((err as any).message) : "Failed to verify OTP";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    try {
      await signupSetPassword(email, password, tempToken, username);
      // After successful signup, immediately log the user in (same credentials)
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err ? String((err as any).message) : "Failed to create account";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderContent() {
    if (step === "email") {
      return (
        <form className="mt-6 space-y-4" onSubmit={handleEmail}>
          <div className="space-y-1.5">
            <label className="label" htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              inputMode="email"
            />
          </div>

          {info ? (
            <div className="text-xs text-blue-800 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-2.5">
              {info}
            </div>
          ) : null}

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
            {isSubmitting ? "Sending code…" : "Send verification code"}
          </button>
        </form>
      );
    }

    if (step === "otp") {
      return (
        <form className="mt-6 space-y-4" onSubmit={handleOtp}>
          <div className="space-y-1.5">
            <label className="label" htmlFor="signup-otp">
              Enter 6‑digit code
            </label>
            <input
              id="signup-otp"
              className="input tracking-[0.3em]"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              required
              inputMode="numeric"
              maxLength={6}
            />
          </div>

          {info ? (
            <div className="text-xs text-blue-800 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-2.5">
              {info}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Didn’t get the email? Wait a few seconds and check spam as well.
            </p>
          )}

          {error ? (
            <div
              className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          ) : null}

          <div className="flex gap-3">
            <button
              type="button"
              className="btn btn-ghost flex-1"
              onClick={() => {
                setStep("email");
                setOtp("");
                setInfo(null);
                setError(null);
              }}
            >
              Back
            </button>
            <button className="btn btn-primary flex-1" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Verifying…" : "Verify code"}
            </button>
          </div>
        </form>
      );
    }

    // step === "password"
    return (
      <form className="mt-6 space-y-4" onSubmit={handlePassword}>
        <div className="space-y-1.5">
          <label className="label" htmlFor="signup-username">
            Username
          </label>
          <input
            id="signup-username"
            className="input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="cool_username"
            required
            autoComplete="username"
          />
          <p className="text-[11px] text-slate-500">
            3–20 characters. Letters, numbers, and underscores are allowed.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="signup-password">
              Password
            </label>
            <button
              type="button"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <input
            id="signup-password"
            className="input"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            required
            autoComplete="new-password"
          />
          <p className="text-[11px] text-slate-500">
            Use at least 8 characters with a mix of letters, numbers, and symbols.
          </p>
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

        <div className="flex gap-3">
          <button
            type="button"
            className="btn btn-ghost flex-1"
            onClick={() => {
              setStep("otp");
              setError(null);
            }}
          >
            Back
          </button>
          <button className="btn btn-primary flex-1" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </div>
      </form>
    );
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
                <h1 className="text-xl font-semibold leading-tight">Create your account</h1>
                <p className="text-sm text-slate-600">
                  We’ll verify your email, then you can pick a username and password.
                </p>
              </div>
            </div>

            {/* Step indicator */}
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <span
                className={`h-1.5 flex-1 rounded-full ${
                  step === "email" ? "bg-blue-600" : "bg-blue-200"
                }`}
              />
              <span
                className={`h-1.5 flex-1 rounded-full ${
                  step === "otp" ? "bg-blue-600" : step === "password" ? "bg-blue-400" : "bg-blue-100"
                }`}
              />
              <span
                className={`h-1.5 flex-1 rounded-full ${
                  step === "password" ? "bg-blue-600" : "bg-blue-100"
                }`}
              />
            </div>

            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

