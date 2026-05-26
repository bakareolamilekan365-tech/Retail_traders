import PropTypes from "prop-types";

import AvatarMenu from "./AvatarMenu.jsx";

const TopBar = ({ user, showAvatar, onLogout, onChangePassword }) => {
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
  onLogout: PropTypes.func.isRequired,
  onChangePassword: PropTypes.func.isRequired,
};

TopBar.defaultProps = {
  showAvatar: false,
};

export default TopBar;
