import { useEffect, useState } from "react";

import { apiFetch } from "../utils/api.js";

const formatPercent = (value) => {
  if (value === null || value === undefined) return "N/A";
  const sign = value > 0 ? "+" : "";
  return `${sign}${Number(value).toFixed(2)}%`;
};

const AdminPanel = () => {
  const [activeView, setActiveView] = useState("stats");
  const [users, setUsers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      setError("");
      try {
        const [usersResponse, predictionsResponse, statsResponse] = await Promise.all([
          apiFetch("/admin/users"),
          apiFetch("/admin/predictions"),
          apiFetch("/admin/stats"),
        ]);

        if (!usersResponse.ok || !predictionsResponse.ok || !statsResponse.ok) {
          throw new Error("Failed to load admin data");
        }

        const [usersPayload, predictionsPayload, statsPayload] = await Promise.all([
          usersResponse.json(),
          predictionsResponse.json(),
          statsResponse.json(),
        ]);

        setUsers(usersPayload);
        setPredictions(predictionsPayload);
        setStats(statsPayload);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-[var(--app-muted)]">Loading admin panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
        {error}
      </div>
    );
  }

  return (
    <section className="card p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-accent)]">
            Admin
          </p>
          <h2 className="text-xl font-semibold text-[var(--app-text)]">
            System Oversight
          </h2>
        </div>
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
          {[
            { id: "stats", label: "Stats" },
            { id: "users", label: "Users" },
            { id: "predictions", label: "Predictions" },
          ].map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => setActiveView(view.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ${
                activeView === view.id
                  ? "bg-[var(--app-accent)] text-white"
                  : "border border-[var(--app-border)] text-[var(--app-muted)]"
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {activeView === "stats" && stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-[var(--app-border)] p-4">
            <p className="text-xs uppercase text-[var(--app-muted)]">Users</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--app-text)]">
              {stats.total_users}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--app-border)] p-4">
            <p className="text-xs uppercase text-[var(--app-muted)]">Predictions</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--app-text)]">
              {stats.total_predictions}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--app-border)] p-4">
            <p className="text-xs uppercase text-[var(--app-muted)]">Top Asset</p>
            <p className="mt-2 text-lg font-semibold text-[var(--app-text)]">
              {stats.top_asset || "N/A"}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--app-border)] p-4">
            <p className="text-xs uppercase text-[var(--app-muted)]">Most Active User</p>
            <p className="mt-2 text-lg font-semibold text-[var(--app-text)]">
              {stats.most_active_user || "N/A"}
            </p>
          </div>
        </div>
      )}

      {activeView === "users" && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="text-xs uppercase text-[var(--app-muted)]">
              <tr>
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Username</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((row) => (
                <tr key={row.id} className="border-t border-[var(--app-border)]">
                  <td className="py-2 pr-4 text-[var(--app-muted)]">{row.id}</td>
                  <td className="py-2 pr-4 font-medium text-[var(--app-text)]">
                    {row.username}
                  </td>
                  <td className="py-2 pr-4 text-[var(--app-muted)]">{row.email}</td>
                  <td className="py-2 pr-4 text-[var(--app-muted)]">
                    {row.is_admin ? "Admin" : "Trader"}
                  </td>
                  <td className="py-2 pr-4 text-[var(--app-muted)]">{row.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeView === "predictions" && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="text-xs uppercase text-[var(--app-muted)]">
              <tr>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">User ID</th>
                <th className="py-2 pr-4">Asset</th>
                <th className="py-2 pr-4">Signal</th>
                <th className="py-2 pr-4">Return</th>
                <th className="py-2 pr-4">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((row) => (
                <tr key={row.id} className="border-t border-[var(--app-border)]">
                  <td className="py-2 pr-4 text-[var(--app-muted)]">{row.timestamp}</td>
                  <td className="py-2 pr-4 text-[var(--app-muted)]">
                    {row.user_id || "N/A"}
                  </td>
                  <td className="py-2 pr-4 font-medium text-[var(--app-text)]">
                    {row.asset}
                  </td>
                  <td className="py-2 pr-4 text-[var(--app-muted)]">{row.signal}</td>
                  <td className="py-2 pr-4 text-[var(--app-muted)]">
                    {formatPercent(row.expected_return)}
                  </td>
                  <td className="py-2 pr-4 text-[var(--app-muted)]">
                    {Math.round(row.confidence * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AdminPanel;
