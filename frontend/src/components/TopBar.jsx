import PropTypes from "prop-types";

import AvatarMenu from "./AvatarMenu.jsx";
import PresetSwitcher from "./PresetSwitcher.jsx";

const TopBar = ({
  presets,
  activePresetId,
  onPresetChange,
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
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Investment Assistant
          </p>
          <h1 className="text-xl font-semibold text-[var(--app-text)]">
            Investment Assistant
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <PresetSwitcher
            presets={presets}
            activePresetId={activePresetId}
            onChange={onPresetChange}
          />
          {adminChecked && user.isAdmin && (
            <button
              type="button"
              onClick={onAdminClick}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-200 border border-[var(--app-border)] bg-[var(--app-card)]"
            >
              Admin
            </button>
          )}
          <button
            type="button"
            aria-label="Toggle dark mode"
            onClick={onToggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-card)] text-slate-600 dark:text-slate-200"
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
  presets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      colors: PropTypes.shape({
        accent: PropTypes.string.isRequired,
      }).isRequired,
    }),
  ).isRequired,
  activePresetId: PropTypes.string.isRequired,
  onPresetChange: PropTypes.func.isRequired,
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
