import { useCallback, useEffect, useMemo, useState } from "react";

import { apiFetch } from "../utils/api.js";

const parseLogsContent = (payload) =>
  payload?.content || payload?.lines?.join("\n") || "";

const formatUpdatedAt = (value) => {
  if (!value) return "Just refreshed";

  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return "Just refreshed";
  }
};

const AuditLogs = ({ compact = false, canAccess = true, onBack }) => {
  const [logs, setLogs] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/admin/logs");
      if (!response.ok) {
        throw new Error("Failed to load audit logs");
      }

      const payload = await response.json();
      setLogs(parseLogsContent(payload));
      setUpdatedAt(new Date().toISOString());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }

    void loadLogs();
  }, [canAccess, loadLogs]);

  const lineCount = useMemo(() => {
    if (!logs) return 0;
    return logs.split("\n").filter(Boolean).length;
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const lines = logs.split("\n").filter(Boolean);
    const normalizedQuery = searchTerm.trim().toLowerCase();

    if (!normalizedQuery) {
      return lines.join("\n");
    }

    return lines
      .filter((line) => line.toLowerCase().includes(normalizedQuery))
      .join("\n");
  }, [logs, searchTerm]);

  const filteredLineCount = useMemo(() => {
    if (!filteredLogs) return 0;
    return filteredLogs.split("\n").filter(Boolean).length;
  }, [filteredLogs]);

  if (!canAccess) {
    return (
      <section className="card p-4 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-accent)]">
          Audit Logs
        </p>
        <h2 className="mt-1 text-xl font-semibold text-[var(--app-text)] dark:text-white">
          Access restricted
        </h2>
        <p className="mt-2 text-sm text-slate-700 dark:text-white">
          You need administrator access to view backend logs.
        </p>
        {onBack && (
          <button type="button" className="btn-primary mt-4" onClick={onBack}>
            Back to Dashboard
          </button>
        )}
      </section>
    );
  }

  return (
    <section className={compact ? "space-y-3" : "card p-4 sm:p-6"}>
      {!compact && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-accent)]">
              Audit Logs
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--app-text)] dark:text-white">
              Backend activity stream
            </h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-white">
              Review the latest backend events without leaving the dashboard
              shell.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {onBack && (
              <button type="button" className="btn-secondary" onClick={onBack}>
                Back to Admin
              </button>
            )}
            <button type="button" className="btn-primary" onClick={loadLogs}>
              Refresh logs
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 dark:text-white">
        <span className="rounded-full border border-[var(--app-border)] px-3 py-1">
          {loading ? "Loading" : `${filteredLineCount} / ${lineCount} lines`}
        </span>
        <span className="rounded-full border border-[var(--app-border)] px-3 py-1">
          {formatUpdatedAt(updatedAt)}
        </span>
        {compact && onBack && (
          <button type="button" className="btn-secondary" onClick={onBack}>
            Back to Admin
          </button>
        )}
        {compact && (
          <button type="button" className="btn-primary" onClick={loadLogs}>
            Refresh logs
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="audit-log-search">
          Search logs
        </label>
        <input
          id="audit-log-search"
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search log messages, dates, or levels"
          className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-4 py-2 text-sm text-[var(--app-text)] outline-none placeholder:text-slate-400 focus:border-[var(--app-accent)] dark:text-white"
        />
        {searchTerm && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setSearchTerm("")}
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      <textarea
        readOnly
        aria-label="Audit logs"
        value={
          loading && !logs
            ? "Loading audit logs..."
            : filteredLogs ||
              (searchTerm ? "No matching log lines." : "No logs available.")
        }
        className={`w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 text-xs leading-6 text-[var(--app-text)] dark:text-white ${compact ? "h-72" : "h-[32rem]"}`}
      />
    </section>
  );
};

export default AuditLogs;
