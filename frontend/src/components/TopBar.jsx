import PropTypes from "prop-types";

import AvatarMenu from "./AvatarMenu.jsx";

const TopBar = ({
  darkMode,
  onToggleDarkMode,
  user,
  showAvatar,
  onLogout,
  onChangePassword,
  adminChecked,
  onAdminClick,
}) => {
  return (
    <header className="border-b border-[var(--app-border)] bg-[var(--app-bg)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-[var(--app-text)] sm:text-2xl">
            TradeSense NG
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--app-muted)]">
            AI Investment Signals
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {adminChecked && user.isAdmin && (
            <button
              type="button"
              onClick={onAdminClick}
              className="rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2 text-sm font-semibold text-[var(--app-text)]"
            >
              Admin
            </button>
          )}
          <button
            type="button"
            aria-label="Toggle dark mode"
            onClick={onToggleDarkMode}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text)]"
          >
            {darkMode ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 4.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 12 4.25Zm6.5 7.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Zm-13 0a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Zm9.91-5.91a.75.75 0 0 1 1.06 0l.35.35a.75.75 0 0 1-1.06 1.06l-.35-.35a.75.75 0 0 1 0-1.06Zm-8.82 8.82a.75.75 0 0 1 1.06 0l.35.35a.75.75 0 1 1-1.06 1.06l-.35-.35a.75.75 0 0 1 0-1.06Zm10.17 1.41a.75.75 0 0 1 0 1.06l-.35.35a.75.75 0 0 1-1.06-1.06l.35-.35a.75.75 0 0 1 1.06 0Zm-8.46-8.46a.75.75 0 0 1 0 1.06l-.35.35a.75.75 0 0 1-1.06-1.06l.35-.35a.75.75 0 0 1 1.06 0ZM12 7.25a4.75 4.75 0 1 0 0 9.5 4.75 4.75 0 0 0 0-9.5Z"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12.7 2.75a.75.75 0 0 1 .7.98A7.25 7.25 0 0 0 19.27 19.6a.75.75 0 0 1 .98.7 9.5 9.5 0 1 1-7.55-17.55Z"
                />
              </svg>
            )}
          </button>
          {showAvatar && (
            <AvatarMenu
              username={user.username}
              isAdmin={user.isAdmin}
              onLogout={onLogout}
              onChangePassword={onChangePassword}
            />
          )}
        </div>
      </div>
    </header>
  );
};

TopBar.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  onToggleDarkMode: PropTypes.func.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool.isRequired,
  }).isRequired,
  showAvatar: PropTypes.bool,
  onLogout: PropTypes.func.isRequired,
  onChangePassword: PropTypes.func.isRequired,
  adminChecked: PropTypes.bool,
  onAdminClick: PropTypes.func,
};

TopBar.defaultProps = {
  showAvatar: false,
  adminChecked: false,
  onAdminClick: () => {},
};

export default TopBar;
