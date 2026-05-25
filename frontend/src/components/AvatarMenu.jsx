import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'

const AvatarMenu = ({ username, isAdmin, onLogout, onChangePassword }) => {
  const [open, setOpen] = useState(false)
  const roleLabel = isAdmin ? 'Administrator' : 'Trader'
  const avatarUrl = useMemo(
    () =>
      `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff`,
    [username]
  )

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Open user menu"
        className="flex items-center rounded-full border border-[var(--app-border)] bg-[var(--app-card)] p-1"
        onClick={() => setOpen((prev) => !prev)}
      >
        <img
          src={avatarUrl}
          alt={`${username} avatar`}
          className="h-9 w-9 rounded-full object-cover"
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] shadow-xl">
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-[var(--app-text)]">
              {username} – {roleLabel}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Online
            </div>
          </div>
          <div className="border-t border-[var(--app-border)]" />
          <div className="p-2">
            <button
              type="button"
              onClick={onChangePassword}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Change Password
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

AvatarMenu.propTypes = {
  username: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool,
  onLogout: PropTypes.func.isRequired,
  onChangePassword: PropTypes.func.isRequired,
}

AvatarMenu.defaultProps = {
  isAdmin: false,
}

export default AvatarMenu
