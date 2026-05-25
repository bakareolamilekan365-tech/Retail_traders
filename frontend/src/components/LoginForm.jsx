import { useState } from 'react'
import PropTypes from 'prop-types'

const LoginForm = ({ onSubmit, onSwitch, loading, error }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({ username: username.trim(), password })
  }

  return (
    <div className="card w-full max-w-md p-6">
      <h2 className="text-2xl font-semibold text-[var(--app-text)]">Welcome back</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Sign in to continue.</p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
            htmlFor="login-username"
          >
            Username
          </label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="e.g. demo"
            required
          />
        </div>

        <div>
          <label
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
            htmlFor="login-password"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Your password"
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        New here?{' '}
        <button
          type="button"
          className="font-semibold text-[var(--app-accent)]"
          onClick={onSwitch}
        >
          Create an account
        </button>
      </div>
    </div>
  )
}

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onSwitch: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
}

LoginForm.defaultProps = {
  loading: false,
  error: '',
}

export default LoginForm
