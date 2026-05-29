import PropTypes from "prop-types";

import AvatarMenu from "./AvatarMenu.jsx";

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 3v2.25M12 18.75V21M4.22 4.22l1.59 1.59M18.19 18.19l1.59 1.59M3 12h2.25M18.75 12H21M4.22 19.78l1.59-1.59M18.19 5.81l1.59-1.59M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M21 13.2A8.25 8.25 0 1 1 10.8 3a6.8 6.8 0 1 0 10.2 10.2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TopBar = ({
  user,
  showAvatar,
  theme,
  onToggleTheme,
  onLogout,
  onChangePassword,
}) => {
  const isDarkMode = theme === "dark";

  return (
    <header className="border-b border-gray-200 bg-[var(--app-bg)] dark:border-gray-800">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-[var(--app-text)] dark:text-white sm:text-2xl">
            TradeSense NG
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-700 dark:text-white">
            AI Investment Signals
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={isDarkMode}
            onClick={onToggleTheme}
            className="theme-toggle"
          >
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
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
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool.isRequired,
  }).isRequired,
  showAvatar: PropTypes.bool,
  theme: PropTypes.oneOf(["dark", "light"]),
  onToggleTheme: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onChangePassword: PropTypes.func.isRequired,
};

TopBar.defaultProps = {
  showAvatar: false,
  theme: "dark",
};

export default TopBar;
