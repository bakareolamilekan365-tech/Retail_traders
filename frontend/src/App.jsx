import { useEffect, useMemo, useState } from 'react'
import LoginForm from './components/LoginForm.jsx'
import RegisterForm from './components/RegisterForm.jsx'
import UserMenu from './components/UserMenu.jsx'
import Dashboard from './components/Dashboard.jsx'
import {
  changePassword,
  checkAdmin,
  clearToken,
  decodeTokenPayload,
  getToken,
  loginUser,
  registerUser,
} from './utils/api.js'

const App = () => {
  const [token, setToken] = useState(getToken())
  const [authView, setAuthView] = useState('login')
  const [user, setUser] = useState({ username: '', isAdmin: false })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' })
  const [passwordStatus, setPasswordStatus] = useState({ error: '', success: '' })
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')

  const isAuthenticated = useMemo(() => Boolean(token), [token])

  useEffect(() => {
    if (!token) {
      setUser({ username: '', isAdmin: false })
      return
    }
    const payload = decodeTokenPayload(token)
    const username = payload?.sub || 'user'
    setUser((prev) => ({ ...prev, username }))

    checkAdmin()
      .then((isAdmin) => setUser((prev) => ({ ...prev, isAdmin })))
      .catch(() => setUser((prev) => ({ ...prev, isAdmin: false })))
  }, [token])

  useEffect(() => {
    const nextTheme = darkMode ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', nextTheme)
  }, [darkMode])

  const handleLogin = async ({ username, password }) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      await loginUser({ username, password })
      setToken(getToken())
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleRegister = async ({ username, email, password }) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      await registerUser({ username, email, password })
      setToken(getToken())
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    clearToken()
    setToken(null)
    setAuthView('login')
    setPasswordForm({ oldPassword: '', newPassword: '' })
    setPasswordStatus({ error: '', success: '' })
    setShowChangePassword(false)
  }

  const handleChangePassword = async (event) => {
    event.preventDefault()
    setPasswordStatus({ error: '', success: '' })
    try {
      await changePassword({
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword,
      })
      setPasswordStatus({ error: '', success: 'Password updated successfully.' })
      setPasswordForm({ oldPassword: '', newPassword: '' })
      setShowChangePassword(false)
    } catch (error) {
      setPasswordStatus({ error: error.message, success: '' })
    }
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Intelligent Investment Assistant
              </p>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                Retail Trader Dashboard
              </h1>
            </div>
            {isAuthenticated && (
              <UserMenu
                username={user.username || 'user'}
                isAdmin={user.isAdmin}
                onLogout={handleLogout}
                onChangePassword={() => setShowChangePassword(true)}
              />
            )}
          </div>
        </header>

        <main className="mx-auto flex max-w-7xl flex-col items-center px-6 py-10">
          {!isAuthenticated ? (
            authView === 'login' ? (
              <LoginForm
                onSubmit={handleLogin}
                onSwitch={() => setAuthView('register')}
                loading={authLoading}
                error={authError}
              />
            ) : (
              <RegisterForm
                onSubmit={handleRegister}
                onSwitch={() => setAuthView('login')}
                loading={authLoading}
                error={authError}
              />
            )
          ) : (
            <div className="w-full space-y-6">
              {showChangePassword && (
                <div className="card p-6 dark:bg-slate-800 dark:ring-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Change password
                  </h3>
                  <form className="mt-4 space-y-4" onSubmit={handleChangePassword}>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="old-password">
                        Current password
                      </label>
                      <input
                        id="old-password"
                        type="password"
                        value={passwordForm.oldPassword}
                        onChange={(event) =>
                          setPasswordForm((prev) => ({ ...prev, oldPassword: event.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="new-password">
                        New password
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(event) =>
                          setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                        required
                      />
                    </div>
                    {passwordStatus.error && (
                      <div className="rounded-lg bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-700 dark:text-red-200">
                        {passwordStatus.error}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <button type="submit" className="btn-primary">
                        Update password
                      </button>
                      <button
                        type="button"
                        className="btn-secondary dark:bg-slate-700 dark:text-slate-100"
                        onClick={() => setShowChangePassword(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {passwordStatus.success && (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200">
                  {passwordStatus.success}
                </div>
              )}

              <Dashboard darkMode={darkMode} onToggleDarkMode={() => setDarkMode((prev) => !prev)} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
