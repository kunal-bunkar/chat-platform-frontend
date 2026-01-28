import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50" />
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="relative container-page">
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white grid place-items-center shadow-sm">
                    <span className="text-base font-bold">C</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold leading-tight">Home</h1>
                    <p className="text-sm text-slate-600">Authenticated area (temporary UI)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="pill">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {user?.email || "Signed in"}
                  </span>
                  <button className="btn btn-dark" onClick={onLogout}>
                    Logout
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-700">
                    Next step: we’ll replace this with the real chat home and wire your existing chat components.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Session</div>
                  <div className="mt-2 text-sm text-slate-700">
                    <div>
                      <span className="font-medium">User:</span> {user?.email || "—"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Logging out clears local tokens (and also calls backend logout when available).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

