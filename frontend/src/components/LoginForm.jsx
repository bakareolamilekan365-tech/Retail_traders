import { useState } from "react";
import PropTypes from "prop-types";
import heroImage from "../assets/hero.png";

const LoginForm = ({ onSubmit, onSwitch, loading, error, theme, onToggleTheme }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotMessage, setShowForgotMessage] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ username: username.trim(), password });
  };

  const handleDemoGoogle = () => {
    window.alert("Google sign-in is demo mode on this page.");
  };

  return (
    <div className="relative grid w-full max-w-5xl overflow-hidden rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        <button
          type="button"
          aria-label="Back to home"
          className="hidden rounded-full border border-slate-700/70 bg-slate-950/50 px-4 py-2 text-sm font-medium text-slate-100 lg:inline-flex"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          ← Back to Home
        </button>
        <button
          type="button"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="grid h-11 w-11 place-items-center rounded-full border border-slate-700/70 bg-slate-950/50 text-slate-100"
          onClick={onToggleTheme}
        >
          {theme === "dark" ? "☾" : "☀"}
        </button>
      </div>

      <div className="relative min-h-[340px] bg-slate-950 p-5 text-white sm:p-7 lg:min-h-[700px] lg:p-8">
        <div className="absolute inset-0 opacity-40">
          <img src={heroImage} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(16,185,129,0.18),transparent_24%),radial-gradient(circle_at_80%_65%,rgba(168,85,247,0.16),transparent_22%),linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.88))]" />
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/30 bg-gradient-to-br from-[#0f172a] to-[#00251c] shadow-[0_0_35px_rgba(16,185,129,0.18)]">
                <span className="text-lg font-black text-green-400">↗</span>
              </div>
              <div>
                <div className="text-lg font-semibold leading-none tracking-tight">
                  TradeSense <span className="text-green-400">NG</span>
                </div>
                <div className="text-xs text-slate-400">AI Investment Signals</div>
              </div>
            </div>
            <div className="h-11 lg:hidden" />
          </div>

          <div className="mt-6 flex h-full flex-col justify-between gap-6 lg:mt-10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/8 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                AI-powered • smarter investing
              </div>

              <h2 className="max-w-[12ch] text-[2.55rem] font-black leading-[0.96] tracking-tight text-white sm:text-[3.25rem] lg:text-[4.25rem]">
                AI-Powered Signals for <span className="text-green-400">NGX Stocks</span> and <span className="text-green-400">Crypto</span>
              </h2>

              <p className="max-w-[32rem] text-sm leading-6 text-slate-300 sm:text-[1rem]">
                Analyze historical price action, technical indicators, and model-backed 7-day signals in one focused dashboard.
              </p>

              <div className="space-y-3 pt-1">
                {[
                  ["Smart AI Signals", "Model-backed buy/sell signals across stocks & crypto"],
                  ["Data-Driven Insights", "Advanced analytics and technical indicators you can trust"],
                  ["Real-Time Advantage", "Stay ahead with live updates and market intelligence"],
                ].map(([title, body]) => (
                  <div key={title} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/30 p-3.5 backdrop-blur-sm">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-green-400">
                      ↑
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{title}</div>
                      <div className="mt-1 text-sm leading-5 text-slate-300">{body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trusted by investors section removed per design request */}
          </div>
        </div>
      </div>

      <div className="flex min-h-[340px] items-center p-6 sm:p-7 lg:min-h-[700px] lg:p-8">
        <div className="w-full">
          <h2 className="text-2xl font-semibold text-[var(--app-text)] dark:text-white">
            Sign in
          </h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-white">
            Access the Intelligent Investment Recommendation Assistant.
          </p>

          {error && <div className="auth-error-banner">{error}</div>}

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-white" htmlFor="login-username">
                Username
              </label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-3 text-sm text-[var(--app-text)] dark:text-white"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-white" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-3 text-sm text-[var(--app-text)] dark:text-white"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="button"
              className="text-sm font-semibold text-[var(--app-accent)]"
              onClick={() => setShowForgotMessage(true)}
            >
              Forgot Password?
            </button>

            {showForgotMessage && (
              <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-soft)] px-3 py-2 text-sm text-[var(--app-text)] dark:text-white">
                Please contact the administrator to reset your password.
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-700 dark:text-white">OR</div>

          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-sm font-semibold text-[var(--app-text)] dark:text-white"
            onClick={handleDemoGoogle}
          >
            <span className="text-base font-bold text-red-500">G</span>
            Continue with Google
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-slate-500 dark:text-slate-300">
            <span aria-hidden="true">🛡</span>
            <span>Your data is encrypted and secure</span>
          </div>

          <div className="mt-5 text-center text-sm text-slate-700 dark:text-white">
            New here?{" "}
            <button type="button" className="font-semibold text-[var(--app-accent)]" onClick={onSwitch}>
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onSwitch: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  theme: PropTypes.oneOf(["dark", "light"]),
  onToggleTheme: PropTypes.func,
};

LoginForm.defaultProps = {
  loading: false,
  error: "",
  theme: "dark",
  onToggleTheme: () => {},
};

export default LoginForm;
