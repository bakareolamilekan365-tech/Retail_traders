import { useState } from "react";
import PropTypes from "prop-types";

const RegisterForm = ({ onSubmit, onSwitch, loading, error }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ username: username.trim(), email: email.trim(), password });
  };

  return (
    <div className="card w-full max-w-md p-6">
      <h2 className="text-2xl font-semibold text-[var(--app-text)]">
        Create account
      </h2>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
        Start tracking signals in minutes.
      </p>

      {error && <div className="auth-error-banner">{error}</div>}

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
            htmlFor="register-username"
          >
            Username
          </label>
          <input
            id="register-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="e.g. trader01"
            required
          />
        </div>

        <div>
          <label
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
            htmlFor="register-email"
          >
            Email
          </label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
            htmlFor="register-password"
          >
            Password
          </label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Create a password"
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-slate-700 dark:text-slate-300">
        Already have an account?{" "}
        <button
          type="button"
          className="font-semibold text-[var(--app-accent)]"
          onClick={onSwitch}
        >
          Sign in
        </button>
      </div>
    </div>
  );
};

RegisterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onSwitch: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

RegisterForm.defaultProps = {
  loading: false,
  error: "",
};

export default RegisterForm;
