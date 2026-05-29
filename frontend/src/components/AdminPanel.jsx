import { useEffect, useState } from "react";

import { apiFetch } from "../utils/api.js";

const formatPercent = (value) => {
  if (value === null || value === undefined) return "N/A";
  const sign = value > 0 ? "+" : "";
  return `${sign}${Number(value).toFixed(2)}%`;
};

const ConfirmModal = ({ title, message, confirmLabel, onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
    <div className="w-full max-w-md rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-2xl">
      <h3 className="text-lg font-semibold text-[var(--app-text)] dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-white">
        {message}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

const AdminPanel = () => {
  const [activeView, setActiveView] = useState("stats");
  const [users, setUsers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState(null);
  const [assets, setAssets] = useState([]);
  const [logs, setLogs] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const loadAdminData = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersResponse, predictionsResponse, statsResponse, assetsResponse, logsResponse] =
        await Promise.all([
          apiFetch("/admin/users"),
          apiFetch("/admin/predictions"),
          apiFetch("/admin/stats"),
          apiFetch("/admin/assets"),
          apiFetch("/admin/logs"),
        ]);

      if (
        !usersResponse.ok ||
        !predictionsResponse.ok ||
        !statsResponse.ok ||
        !assetsResponse.ok ||
        !logsResponse.ok
      ) {
        throw new Error("Failed to load admin data");
      }

      const [usersPayload, predictionsPayload, statsPayload, assetsPayload, logsPayload] =
        await Promise.all([
          usersResponse.json(),
          predictionsResponse.json(),
          statsResponse.json(),
          assetsResponse.json(),
          logsResponse.json(),
        ]);

      setUsers(usersPayload);
      setPredictions(predictionsPayload);
      setStats(statsPayload);
      setAssets(assetsPayload);
      setLogs(logsPayload.content || logsPayload.lines?.join("\n") || "");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  const runAdminAction = async (action, successMessage) => {
    setActionLoading(true);
    setActionError("");
    setActionMessage("");
    try {
      await action();
      setActionMessage(successMessage);
      await loadAdminData();
    } catch (actionError) {
      setActionError(actionError.message);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const promptDeleteUser = (row) => {
    setConfirmAction({
      title: `Delete ${row.username}?`,
      message:
        "This will remove the user and their prediction history. This action cannot be undone.",
      confirmLabel: "Delete user",
      onConfirm: () =>
        runAdminAction(async () => {
          const response = await apiFetch(`/admin/users/${row.id}`, {
            method: "DELETE",
          });
          if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            throw new Error(payload.detail || "Failed to delete user");
          }
        }, `Deleted user ${row.username}`),
    });
  };

  const promptClearPredictions = () => {
    setConfirmAction({
      title: "Clear prediction history?",
      message:
        "This will delete all prediction history rows for every user. This action cannot be undone.",
      confirmLabel: "Clear history",
      onConfirm: () =>
        runAdminAction(async () => {
          const response = await apiFetch("/admin/predictions", {
            method: "DELETE",
          });
          if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            throw new Error(payload.detail || "Failed to clear prediction history");
          }
        }, "Cleared prediction history"),
    });
  };

  const retrainModel = async () => {
    await runAdminAction(async () => {
      const response = await apiFetch("/admin/retrain", {
        method: "POST",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || "Failed to retrain model");
      }
    }, "Model retraining completed successfully");
  };

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-slate-700 dark:text-white">Loading admin panel...</p>
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
          <h2 className="text-xl font-semibold text-[var(--app-text)] dark:text-white">
            System Oversight
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "stats", label: "Stats" },
            { id: "users", label: "Users" },
            { id: "predictions", label: "Predictions" },
            { id: "assets", label: "Assets" },
            { id: "logs", label: "Logs" },
          ].map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => setActiveView(view.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ${
                activeView === view.id
                  ? "bg-[var(--app-accent)] text-white"
                  : "border border-[var(--app-border)] text-slate-700 dark:text-white"
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {(actionMessage || actionError) && (
        <div
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            actionError
              ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
          }`}
        >
          {actionError || actionMessage}
        </div>
      )}

      {activeView === "stats" && stats && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary"
              onClick={retrainModel}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Retraining...
                </span>
              ) : (
                "Retrain Model"
              )}
            </button>
            <button type="button" className="btn-secondary" onClick={loadAdminData}>
              Refresh Admin Data
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-[var(--app-border)] p-4">
              <p className="text-xs uppercase text-slate-700 dark:text-white">Users</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--app-text)] dark:text-white">
                {stats.total_users}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--app-border)] p-4">
              <p className="text-xs uppercase text-slate-700 dark:text-white">Predictions</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--app-text)] dark:text-white">
                {stats.total_predictions}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--app-border)] p-4">
              <p className="text-xs uppercase text-slate-700 dark:text-white">Top Asset</p>
              <p className="mt-2 text-lg font-semibold text-[var(--app-text)] dark:text-white">
                {stats.top_asset || "N/A"}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--app-border)] p-4">
              <p className="text-xs uppercase text-slate-700 dark:text-white">
                Most Active User
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--app-text)] dark:text-white">
                {stats.most_active_user || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeView === "users" && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-700 dark:text-white">
              <tr>
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Username</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((row) => (
                <tr key={row.id} className="border-t border-[var(--app-border)]">
                  <td className="py-2 pr-4 text-slate-700 dark:text-white">{row.id}</td>
                  <td className="py-2 pr-4 font-medium text-[var(--app-text)] dark:text-white">
                    {row.username}
                  </td>
                  <td className="py-2 pr-4 text-slate-700 dark:text-white">{row.email}</td>
                  <td className="py-2 pr-4 text-slate-700 dark:text-white">
                    {row.is_admin ? "Admin" : "Trader"}
                  </td>
                  <td className="py-2 pr-4 text-slate-700 dark:text-white">{row.created_at}</td>
                  <td className="py-2 pr-4">
                    <button
                      type="button"
                      className="rounded-full border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 dark:text-red-200 dark:hover:bg-red-500/10"
                      onClick={() => promptDeleteUser(row)}
                    >
                      Delete user
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeView === "predictions" && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-700 dark:text-white">
              Prediction history controls
            </p>
            <button
              type="button"
              className="rounded-full border border-red-500/30 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 dark:text-red-200 dark:hover:bg-red-500/10"
              onClick={promptClearPredictions}
            >
              Clear prediction history
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-700 dark:text-white">
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
                    <td className="py-2 pr-4 text-slate-700 dark:text-white">{row.timestamp}</td>
                    <td className="py-2 pr-4 text-slate-700 dark:text-white">{row.user_id || "N/A"}</td>
                    <td className="py-2 pr-4 font-medium text-[var(--app-text)] dark:text-white">
                      {row.asset}
                    </td>
                    <td className="py-2 pr-4 text-slate-700 dark:text-white">{row.signal}</td>
                    <td className="py-2 pr-4 text-slate-700 dark:text-white">
                      {formatPercent(row.expected_return)}
                    </td>
                    <td className="py-2 pr-4 text-slate-700 dark:text-white">
                      {Math.round(row.confidence * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === "assets" && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-700 dark:text-white">
              <tr>
                <th className="py-2 pr-4">Symbol</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Toggle</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((row) => (
                <tr key={row.symbol} className="border-t border-[var(--app-border)]">
                  <td className="py-2 pr-4 font-medium text-[var(--app-text)] dark:text-white">
                    {row.symbol}
                  </td>
                  <td className="py-2 pr-4 text-slate-700 dark:text-white">{row.name}</td>
                  <td className="py-2 pr-4 text-slate-700 dark:text-white">{row.status}</td>
                  <td className="py-2 pr-4">
                    <button
                      type="button"
                      disabled
                      className="rounded-full border border-[var(--app-border)] px-3 py-1 text-xs font-semibold text-[var(--app-text)] opacity-60 dark:text-white"
                    >
                      Active
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeView === "logs" && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-700 dark:text-white">
              Backend logs (last 100 lines)
            </p>
            <button type="button" className="btn-secondary" onClick={loadAdminData}>
              Refresh logs
            </button>
          </div>
          <textarea
            readOnly
            value={logs || "No logs available."}
            className="h-72 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] p-3 text-xs leading-6 text-[var(--app-text)] dark:text-white"
          />
        </div>
      )}

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel}
          onCancel={() => setConfirmAction(null)}
          onConfirm={confirmAction.onConfirm}
        />
      )}
    </section>
  );
};

export default AdminPanel;
