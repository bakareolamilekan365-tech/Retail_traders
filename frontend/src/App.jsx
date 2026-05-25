import { useEffect, useMemo, useState } from 'react'
import LoginForm from './components/LoginForm.jsx'
import RegisterForm from './components/RegisterForm.jsx'
import Dashboard from './components/Dashboard.jsx'
import PredictionHistory from './components/PredictionHistory.jsx'
import TopBar from './components/TopBar.jsx'
import {
  changePassword,
  checkAdmin,
  clearToken,
  decodeTokenPayload,
  getToken,
  loginUser,
  registerUser,
} from './utils/api.js'

const PRESETS = [
  {
    id: 'premium',
    name: 'Premium Finance',
    colors: {
      bg: '#0B1220',
      card: '#111B2E',
      accent: '#3B82F6',
      text: '#E5E7EB',
      border: 'rgba(148, 163, 184, 0.2)',
      secondary: '#F97316',
    },
  },
  {
    id: 'terminal',
    name: 'Dark Trading Terminal',
    colors: {
      bg: '#050816',
      card: '#0F172A',
      accent: '#22C55E',
      text: '#E2E8F0',
      border: 'rgba(148, 163, 184, 0.18)',
      secondary: '#38BDF8',
    },
  },
  {
    id: 'institutional',
    name: 'Institutional Analytics',
    colors: {
      bg: '#0F172A',
      card: '#1E293B',
      accent: '#A855F7',
      text: '#F8FAFC',
      border: 'rgba(148, 163, 184, 0.2)',
      secondary: '#F59E0B',
    },
  },
  {
    id: 'saas',
    name: 'Clean SaaS',
    colors: {
      bg: '#F8FAFC',
      card: '#FFFFFF',
      accent: '#2563EB',
      text: '#0F172A',
      border: 'rgba(15, 23, 42, 0.12)',
      secondary: '#14B8A6',
    },
  },
  {
    id: 'market',
    name: 'Modern Market Intelligence',
    colors: {
      bg: '#08111F',
      card: '#121C2E',
      accent: '#F97316',
      text: '#E5E7EB',
      border: 'rgba(148, 163, 184, 0.2)',
      secondary: '#84CC16',
    },
  },
]

const toRgba = (hex, alpha) => {
  const cleanHex = hex.replace('#', '')
  const bigint = parseInt(cleanHex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

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
  const [presetId, setPresetId] = useState(() => localStorage.getItem('preset') || 'premium')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [adminReady, setAdminReady] = useState(false)

  const isAuthenticated = useMemo(() => Boolean(token), [token])
  const activePreset = useMemo(
    () => PRESETS.find((preset) => preset.id === presetId) || PRESETS[0],
    [presetId]
  )

  const chartTheme = useMemo(() => {
    const grid = toRgba(activePreset.colors.text, darkMode ? 0.16 : 0.12)
    return {
      background: activePreset.colors.card,
      text: activePreset.colors.text,
      grid,
      upColor: activePreset.colors.accent,
      downColor: '#ef4444',
      sma14: activePreset.colors.accent,
      sma50: activePreset.colors.secondary,
    }
  }, [activePreset, darkMode])

  useEffect(() => {
    if (!token) {
      setUser({ username: '', isAdmin: false })
      setAdminReady(true)
      return
    }
    setAdminReady(false)
    const payload = decodeTokenPayload(token)
    const username = payload?.sub || 'user'
    setUser({ username, isAdmin: false })

    checkAdmin()
      .then((isAdmin) => {
        setUser({ username, isAdmin })
        setAdminReady(true)
      })
      .catch(() => {
        setUser({ username, isAdmin: false })
        setAdminReady(true)
      })
  }, [token])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--app-bg', activePreset.colors.bg)
    root.style.setProperty('--app-card', activePreset.colors.card)
    root.style.setProperty('--app-accent', activePreset.colors.accent)
    root.style.setProperty('--app-text', activePreset.colors.text)
    root.style.setProperty('--app-border', activePreset.colors.border)
    root.dataset.preset = activePreset.id
    localStorage.setItem('preset', activePreset.id)
  }, [activePreset])

  const handleLogin = async ({ username, password }) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      await loginUser({ username, password })
      setToken(getToken())
      setActiveTab('dashboard')
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
      setActiveTab('dashboard')
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
    setActiveTab('dashboard')
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

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'history', label: 'History' },
    { id: 'settings', label: 'Settings' },
    ...(user.isAdmin ? [{ id: 'admin', label: 'Admin' }] : []),
  ]

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <TopBar
        presets={PRESETS}
        activePresetId={activePreset.id}
        onPresetChange={setPresetId}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        user={{ username: user.username || 'user', isAdmin: user.isAdmin }}
        showAvatar={isAuthenticated && adminReady}
        onLogout={handleLogout}
        onChangePassword={() => {
          setShowChangePassword(true)
          setActiveTab('settings')
        }}
      />

      {isAuthenticated && (
        <div className="border-b border-[var(--app-border)] bg-[var(--app-bg)]">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-6 py-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[var(--app-accent)] text-white'
                      : 'border border-[var(--app-border)] text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-6 py-8">
        {!isAuthenticated ? (
          <div className="flex justify-center">
            {authView === 'login' ? (
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
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'dashboard' && (
              <Dashboard darkMode={darkMode} chartTheme={chartTheme} />
            )}

            {activeTab === 'history' && (
              <PredictionHistory history={[]} loading={false} />
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                {showChangePassword ? (
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-[var(--app-text)]">
                      Change password
                    </h3>
                    <form className="mt-4 space-y-4" onSubmit={handleChangePassword}>
                      <div>
                        <label
                          className="text-sm font-medium text-slate-600 dark:text-slate-300"
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
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                          required
                        />
                      </div>
                      <div>
                        <label
                          className="text-sm font-medium text-slate-600 dark:text-slate-300"
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
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                          required
                        />
                      </div>
                      {passwordStatus.error && (
                        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
                          {passwordStatus.error}
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <button type="submit" className="btn-primary">
                          Update password
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setShowChangePassword(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="card p-6">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Use the profile menu to update your password and preferences.
                    </p>
                  </div>
                )}

                {passwordStatus.success && (
                  <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                    {passwordStatus.success}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-[var(--app-text)]">Admin Center</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Admin analytics and system controls will appear here once wired to the backend.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
