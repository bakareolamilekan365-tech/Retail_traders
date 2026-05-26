import { useState } from "react";
import PropTypes from "prop-types";
import heroImage from "../assets/hero.png";

const LoginForm = ({ onSubmit, onSwitch, loading, error }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ username: username.trim(), password });
  };

  return (
    <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
      <div className="relative min-h-[360px] bg-slate-950 p-6 text-white sm:p-8">
        <div className="absolute inset-0 opacity-40">
          <img
            src={heroImage}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative flex h-full flex-col justify-between gap-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              TradeSense NG
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">
              AI-Powered Signals for NGX Stocks and Crypto
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200">
              Analyze historical price action, technical indicators, and
              model-backed 7-day signals in one focused dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <div className="rounded-full border border-white/15 bg-slate-950/35 px-3 py-1.5 text-slate-100 backdrop-blur">
              NGX equities
            </div>
            <div className="rounded-full border border-white/15 bg-slate-950/35 px-3 py-1.5 text-slate-100 backdrop-blur">
              Major crypto
            </div>
            <div className="rounded-full border border-white/15 bg-slate-950/35 px-3 py-1.5 text-slate-100 backdrop-blur">
              Model-backed signals
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <h3 className="text-2xl font-semibold text-[var(--app-text)]">
          Sign in
        </h3>
        <p className="mt-2 text-sm text-[var(--app-muted)]">
          Access the Intelligent Investment Recommendation Assistant.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="text-sm font-medium text-[var(--app-muted)]"
              htmlFor="login-username"
            >
              Username
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-3 text-sm text-[var(--app-text)]"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-[var(--app-muted)]"
              htmlFor="login-password"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-3 text-sm text-[var(--app-text)]"
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-[var(--app-muted)]">
          New here?{" "}
          <button
            type="button"
            className="font-semibold text-[var(--app-accent)]"
            onClick={onSwitch}
          >
            Create an account
          </button>
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
};

LoginForm.defaultProps = {
  loading: false,
  error: "",
};

export default LoginForm;
