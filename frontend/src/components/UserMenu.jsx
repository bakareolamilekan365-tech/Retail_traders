import { useState } from 'react'
import PropTypes from 'prop-types'

const UserMenu = ({ username, isAdmin, onLogout, onChangePassword }) => {
  const [open, setOpen] = useState(false)

  const handleToggle = () => setOpen((prev) => !prev)

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        onClick={handleToggle}
      >
        <span className="h-7 w-7 rounded-full bg-primary-600 text-xs font-semibold text-white grid place-items-center">
          {username?.slice(0, 2).toUpperCase()}
        </span>
        <span>{username}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="px-4 py-3 text-xs text-slate-700 dark:text-slate-300">Signed in as {username}</div>
          {isAdmin && (
            <a
              href="#admin"
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Admin Panel
            </a>
          )}
          <button
            type="button"
            onClick={onChangePassword}
            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Change Password
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

UserMenu.propTypes = {
  username: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool,
  onLogout: PropTypes.func.isRequired,
  onChangePassword: PropTypes.func.isRequired,
}

UserMenu.defaultProps = {
  isAdmin: false,
}

export default UserMenu
