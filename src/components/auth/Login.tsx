// Login component

import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

type LocationState = {
  from?: { pathname?: string };
};

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = useMemo(() => {
    const state = location.state as LocationState | null;
    return state?.from?.pathname || "/";
  }, [location.state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(fromPath, { replace: true });
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err ? String((err as any).message) : "Login failed";
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
                <h1 className="text-xl font-semibold leading-tight">Welcome back</h1>
                <p className="text-sm text-slate-600">Sign in to continue.</p>
              </div>
            </div>

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
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="label" htmlFor="password">
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
                  id="password"
                  className="input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
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
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5">
                <span>Don&apos;t have an account?</span>
                <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

