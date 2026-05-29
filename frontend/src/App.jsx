import { useCallback, useEffect, useMemo, useState } from "react";
import LoginForm from "./components/LoginForm.jsx";
import RegisterForm from "./components/RegisterForm.jsx";
import Dashboard from "./components/Dashboard.jsx";
import PredictionHistory from "./components/PredictionHistory.jsx";
import SignalSimulator from "./components/SignalSimulator.jsx";
import TopBar from "./components/TopBar.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import {
  changePassword,
  checkAdmin,
  clearToken,
  decodeTokenPayload,
  fetchPredictionHistory,
  getToken,
  loginUser,
  registerUser,
} from "./utils/api.js";

const THEMES = {
  dark: {
    bg: "#050816",
    card: "#0f172a",
    accent: "#22c55e",
    text: "#e2e8f0",
    muted: "#94a3b8",
    border: "rgba(148, 163, 184, 0.22)",
    success: "#22c55e",
    danger: "#ef4444",
    secondary: "#38bdf8",
  },
  light: {
    bg: "#f3f6fb",
    card: "#ffffff",
    accent: "#0f7a3b",
    text: "#0f172a",
    muted: "#516074",
    border: "rgba(15, 23, 42, 0.12)",
    success: "#0f7a3b",
    danger: "#dc2626",
    secondary: "#0ea5e9",
  },
};

const toRgba = (hex, alpha) => {
  const cleanHex = hex.replace("#", "");
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const QuickGuideModal = ({ onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="quick-guide-title"
  >
    <div className="w-full max-w-lg rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-accent)]">
            Quick Guide
          </p>
          <h2
            id="quick-guide-title"
            className="mt-1 text-xl font-semibold text-[var(--app-text)]"
          >
            Reading your signal dashboard
          </h2>
        </div>
        <button
          type="button"
          aria-label="Close quick guide"
          onClick={onClose}
          className="rounded-full border border-[var(--app-border)] px-3 py-1 text-sm text-[var(--app-muted)]"
        >
          Close
        </button>
      </div>
      <ol className="mt-5 space-y-3 text-sm text-[var(--app-muted)]">
        <li>
          1. Choose an NGX equity or major cryptocurrency from the asset
          control.
        </li>
        <li>
          2. Read the candlestick chart and SMA overlays for recent price
          direction.
        </li>
        <li>
          3. Check RSI, volatility, and crossover indicators for momentum and
          risk.
        </li>
        <li>
          4. Review the model signal, expected return, and confidence
          explanation.
        </li>
        <li>5. Open History to audit your recent generated signals.</li>
      </ol>
    </div>
  </div>
);

const SettingsPanel = ({
  showChangePassword,
  onOpenChangePassword,
  onCloseChangePassword,
  onOpenQuickGuide,
  onChangePassword,
  passwordForm,
  setPasswordForm,
  passwordStatus,
}) => (
  <div className="space-y-4">
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--app-text)]">
              Change Password
            </h3>
            <p className="mt-1 text-sm text-[var(--app-muted)]">
              Update your login password at any time.
            </p>
          </div>
          {!showChangePassword && (
            <button
              type="button"
              className="btn-primary"
              onClick={onOpenChangePassword}
            >
              Open form
            </button>
          )}
        </div>

        {showChangePassword && (
          <form className="mt-4 space-y-4" onSubmit={onChangePassword}>
            <div>
              <label
                className="text-sm font-medium text-[var(--app-muted)]"
                htmlFor="old-password"
              >
                Current password
              </label>
              <input
                id="old-password"
                type="password"
                value={passwordForm.oldPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    oldPassword: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-text)]"
                required
              />
            </div>
            <div>
              <label
                className="text-sm font-medium text-[var(--app-muted)]"
                htmlFor="new-password"
              >
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-text)]"
                required
              />
            </div>
            {passwordStatus.error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
                {passwordStatus.error}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="btn-primary">
                Update password
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={onCloseChangePassword}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {passwordStatus.success && (
          <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
            {passwordStatus.success}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-[var(--app-text)]">
            Quick Guide
          </h3>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            Reopen the tutorial whenever you need a refresher.
          </p>
          <button
            type="button"
            className="btn-secondary mt-4"
            onClick={onOpenQuickGuide}
          >
            Open Quick Guide
          </button>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-[var(--app-text)]">
            Preferences
          </h3>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            Default asset and time range coming soon.
          </p>
        </div>
      </div>
    </div>

    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-soft)] px-4 py-3 text-sm text-[var(--app-text)]">
      Use the profile menu for logout and password access from anywhere in the
      app.
    </div>
  </div>
);

const App = () => {
  const [token, setToken] = useState(getToken());
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const savedTheme = window.localStorage.getItem("tradesense-theme");
    return savedTheme === "light" ? "light" : "dark";
  });
  const [authView, setAuthView] = useState("login");
  const [user, setUser] = useState({ username: "", isAdmin: false });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState({
    error: "",
    success: "",
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminChecked, setAdminChecked] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  const [showQuickGuide, setShowQuickGuide] = useState(false);
  const [connectionBanner, setConnectionBanner] = useState(null);
  const [latestPrediction, setLatestPrediction] = useState(null);

  const isAuthenticated = useMemo(() => Boolean(token), [token]);
  const activeTheme = THEMES[theme];

  const chartTheme = useMemo(() => {
    const grid = toRgba(activeTheme.text, 0.16);
    return {
      background: activeTheme.card,
      text: activeTheme.text,
      grid,
      upColor: activeTheme.success,
      downColor: activeTheme.danger,
      sma14: activeTheme.accent,
      sma50: activeTheme.secondary,
    };
  }, [activeTheme]);

  const latestPredictionClose = latestPrediction?.ohlcv?.at(-1)?.close ?? null;

  const tabs = useMemo(() => {
    const visibleTabs = [
      { id: "dashboard", label: "Dashboard" },
      { id: "simulator", label: "Simulator" },
      { id: "history", label: "History" },
      { id: "settings", label: "Settings" },
    ];
    if (adminChecked && user.isAdmin) {
      visibleTabs.push({ id: "admin", label: "Admin" });
    }
    return visibleTabs;
  }, [adminChecked, user.isAdmin]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const rows = await fetchPredictionHistory();
      setHistory(rows);
    } catch (error) {
      setHistoryError(error.message);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "TradeSense NG – AI Investment Signals";
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const isDarkMode = theme === "dark";
    root.classList.toggle("dark", isDarkMode);
    root.dataset.theme = isDarkMode
      ? "dark-trading-terminal"
      : "light-trading-terminal";
    window.localStorage.setItem("tradesense-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!token) {
      setUser({ username: "", isAdmin: false });
      setAdminChecked(true);
      return;
    }
    setAdminChecked(false);
    const payload = decodeTokenPayload(token);
    const username = payload?.sub || "user";
    setUser({ username, isAdmin: false });

    checkAdmin()
      .then((isAdmin) => {
        setUser({ username, isAdmin });
        setAdminChecked(true);
      })
      .catch(() => {
        setUser({ username, isAdmin: false });
        setAdminChecked(true);
      });
  }, [token]);

  useEffect(() => {
    if (adminChecked && !user.isAdmin && activeTab === "admin") {
      setActiveTab("dashboard");
    }
  }, [activeTab, adminChecked, user.isAdmin]);

  const handleLogout = useCallback(() => {
    clearToken();
    setToken(null);
    setAuthView("login");
    setPasswordForm({ oldPassword: "", newPassword: "" });
    setPasswordStatus({ error: "", success: "" });
    setShowChangePassword(false);
    setShowQuickGuide(false);
    setActiveTab("dashboard");
    setHistory([]);
    setLatestPrediction(null);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user.isAdmin) return;
    if (localStorage.getItem("quickGuideDismissed") !== "true") {
      setShowQuickGuide(true);
    }
  }, [isAuthenticated, user.isAdmin]);

  useEffect(() => {
    if (isAuthenticated && activeTab === "history") {
      loadHistory();
    }
  }, [activeTab, isAuthenticated, loadHistory]);

  useEffect(() => {
    const handleNetworkError = (event) => {
      setConnectionBanner({
        message:
          event.detail?.message || "Backend not reachable. Please retry.",
      });
    };

    const handleAuthExpired = (event) => {
      setConnectionBanner(null);
      setAuthError(
        event.detail?.message || "Your session expired. Please sign in again.",
      );
      handleLogout();
    };

    window.addEventListener("tradesense:network-error", handleNetworkError);
    window.addEventListener("tradesense:auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener(
        "tradesense:network-error",
        handleNetworkError,
      );
      window.removeEventListener("tradesense:auth-expired", handleAuthExpired);
    };
  }, [handleLogout]);

  const handleLogin = async ({ username, password }) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      await loginUser({ username, password });
      setToken(getToken());
      setShowDemoBanner(true);
      setActiveTab("dashboard");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      await registerUser({ username, email, password });
      setToken(getToken());
      setShowDemoBanner(true);
      setActiveTab("dashboard");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const dismissConnectionBanner = () => {
    setConnectionBanner(null);
  };

  const retryConnection = () => {
    setConnectionBanner(null);
    window.location.reload();
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const openQuickGuide = () => {
    setShowQuickGuide(true);
  };

  const dismissQuickGuide = () => {
    localStorage.setItem("quickGuideDismissed", "true");
    setShowQuickGuide(false);
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordStatus({ error: "", success: "" });
    try {
      await changePassword({
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword,
      });
      setPasswordStatus({
        error: "",
        success: "Password updated successfully.",
      });
      setPasswordForm({ oldPassword: "", newPassword: "" });
      setShowChangePassword(false);
    } catch (error) {
      setPasswordStatus({ error: error.message, success: "" });
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <TopBar
        user={{ username: user.username || "user", isAdmin: user.isAdmin }}
        showAvatar={isAuthenticated && adminChecked}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        onChangePassword={() => {
          setShowChangePassword(true);
          setActiveTab("settings");
        }}
      />

      {isAuthenticated && (
        <div className="border-b border-[var(--app-border)] bg-[var(--app-bg)]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
            <div className="flex max-w-full flex-wrap items-center gap-2 overflow-x-auto pb-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-[var(--app-accent)] text-white"
                        : "border border-[var(--app-border)] text-[var(--app-text)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
              <button
                type="button"
                className="shrink-0 rounded-full border border-[var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-soft)]"
                onClick={() => setShowQuickGuide(true)}
              >
                Quick Guide
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-7xl flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:py-8">
        {!isAuthenticated ? (
          <div className="flex min-h-full items-center justify-center">
            {authView === "login" ? (
              <LoginForm
                onSubmit={handleLogin}
                onSwitch={() => setAuthView("register")}
                loading={authLoading}
                error={authError}
              />
            ) : (
              <RegisterForm
                onSubmit={handleRegister}
                onSwitch={() => setAuthView("login")}
                loading={authLoading}
                error={authError}
              />
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {connectionBanner && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-red-100">
                    {connectionBanner.message}
                  </p>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      className="btn-secondary border-red-400/30 text-red-100"
                      onClick={retryConnection}
                    >
                      Retry
                    </button>
                    <button
                      type="button"
                      aria-label="Dismiss backend banner"
                      onClick={dismissConnectionBanner}
                      className="text-sm font-semibold text-red-200"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showDemoBanner &&
              ((user.isAdmin && activeTab === "admin") ||
                (!user.isAdmin && activeTab === "dashboard")) && (
                <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-soft)] px-4 py-2.5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-[var(--app-text)]">
                      {user.isAdmin
                        ? "Welcome back, Administrator. Your admin panel is ready."
                        : user.username === "demo"
                          ? "Welcome back, Demo Trader. Your signal dashboard is ready."
                          : "Welcome back, Trader. Your signal dashboard is ready."}
                    </p>
                    <button
                      type="button"
                      aria-label="Dismiss welcome banner"
                      onClick={() => setShowDemoBanner(false)}
                      className="self-start text-sm font-semibold text-[var(--app-accent)] sm:self-auto"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

            <div className="flex flex-col gap-2 px-1 text-xs text-[var(--app-muted)] sm:flex-row sm:items-center sm:justify-between">
              <span>This is an educational tool, not financial advice.</span>
            </div>

            {activeTab === "dashboard" && (
              <Dashboard
                chartTheme={chartTheme}
                onPredictionGenerated={(prediction) => {
                  setLatestPrediction(prediction);
                  if (activeTab === "history") loadHistory();
                }}
              />
            )}

            {activeTab === "simulator" && (
              <SignalSimulator
                asset={latestPrediction?.asset || ""}
                prediction={latestPrediction?.prediction || null}
                latestClose={latestPredictionClose}
              />
            )}

            {activeTab === "history" && (
              <PredictionHistory
                history={history}
                loading={historyLoading}
                error={historyError}
                onRefresh={loadHistory}
              />
            )}

            {activeTab === "settings" && (
              <SettingsPanel
                showChangePassword={showChangePassword}
                onOpenChangePassword={() => setShowChangePassword(true)}
                onCloseChangePassword={() => setShowChangePassword(false)}
                onOpenQuickGuide={openQuickGuide}
                onChangePassword={handleChangePassword}
                passwordForm={passwordForm}
                setPasswordForm={setPasswordForm}
                passwordStatus={passwordStatus}
              />
            )}

            {activeTab === "admin" && adminChecked && user.isAdmin && (
              <AdminPanel />
            )}
          </div>
        )}
      </main>

      {showQuickGuide && <QuickGuideModal onClose={dismissQuickGuide} />}
    </div>
  );
};

export default App;
