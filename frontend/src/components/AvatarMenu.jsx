import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";

const AvatarMenu = ({ username, isAdmin, onLogout, onChangePassword }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const roleLabel = isAdmin ? "Administrator" : "Trader";
  const avatarUrl = useMemo(
    () =>
      `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff`,
    [username],
  );

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Open user menu"
        className="flex items-center rounded-full border border-[var(--app-border)] bg-[var(--app-card)] p-1 text-[var(--app-text)]"
        onClick={() => setOpen((prev) => !prev)}
      >
        <img
          src={avatarUrl}
          alt={`${username} avatar`}
          className="h-9 w-9 rounded-full object-cover"
        />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text)] shadow-xl">
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-[var(--text)]">
              {username} - {roleLabel}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-[var(--app-muted)]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Online
            </div>
          </div>
          <div className="border-t border-[var(--app-border)]" />
          <div className="p-2">
            <button
              type="button"
              onClick={onChangePassword}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--text)] transition hover:bg-[var(--app-soft)]"
            >
              Change Password
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:text-red-700 transition dark:text-red-300"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

AvatarMenu.propTypes = {
  username: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool,
  onLogout: PropTypes.func.isRequired,
  onChangePassword: PropTypes.func.isRequired,
};

AvatarMenu.defaultProps = {
  isAdmin: false,
};

export default AvatarMenu;
