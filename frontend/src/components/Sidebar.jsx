import PropTypes from "prop-types";

const NavItem = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    aria-hidden="true"
    onClick={onClick}
    className={`w-full flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition text-[var(--app-text)] dark:text-white hover:bg-[var(--app-soft)] ${
      active ? "bg-[var(--app-accent)] text-white" : ""
    }`}
  >
    <span className="w-5 h-5 flex-shrink-0" aria-hidden>
      {icon}
    </span>
    <span className="truncate text-left">{label}</span>
  </button>
);

const Sidebar = ({ activeTab, setActiveTab, openAuditLogs, toggleTheme, user, theme, onLogout, mobileMode = false, onClose = () => {} }) => {
  const containerClass = mobileMode
    ? "flex md:hidden w-72 flex-col gap-6 bg-[var(--app-card)] dark:bg-[var(--app-card)] fixed inset-0 z-50 p-4 shadow-2xl"
    : "hidden md:flex md:w-64 md:flex-col md:gap-6";

  return (
    <aside className={containerClass}>
      <div className={`flex ${mobileMode ? "flex-col h-full justify-between" : "sticky top-4 flex h-[calc(100vh-32px)] flex-col justify-between"}`}>
        {mobileMode && (
          <div className="flex items-center justify-between px-2 pb-2">
            <div>
              <h2 className="text-lg font-semibold text-[var(--app-text)] dark:text-white">TradeSense NG</h2>
              <p className="mt-1 text-xs text-slate-700 dark:text-white">AI Investment Signals</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close menu" className="btn-ghost">✕</button>
          </div>
        )}
        <div className="space-y-6">
          <div className="px-4">
            <h2 className="text-lg font-semibold text-[var(--app-text)] dark:text-white">TradeSense NG</h2>
            <p className="mt-1 text-xs text-slate-700 dark:text-white">AI Investment Signals</p>
          </div>

          <nav className="px-2">
            <NavItem
              active={activeTab === "dashboard"}
              onClick={() => setActiveTab("dashboard")}
              label="Dashboard"
              icon={<svg viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            />
            <NavItem
              active={activeTab === "simulator"}
              onClick={() => setActiveTab("simulator")}
              label="Simulator"
              icon={<svg viewBox="0 0 24 24" fill="none"><path d="M3 7h18M3 12h12M3 17h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            />
            <NavItem
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
              label="History"
              icon={<svg viewBox="0 0 24 24" fill="none"><path d="M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0zM12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            />
            <NavItem
              active={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
              label="Settings"
              icon={<svg viewBox="0 0 24 24" fill="none"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 2.28 18.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09c.7 0 1.28-.4 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.71 2.28l.06.06c.45.45 1.06.7 1.71.7.29 0 .58-.04.86-.12.31-.09.65.15.65.47v.09c0 .7.4 1.28 1 1.51.39.16.78.36 1.12.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            />

            <div className="mt-4 border-t border-[var(--app-border)] pt-4">
              <NavItem
                active={false}
                onClick={() => { setActiveTab("admin"); openAuditLogs(); }}
                label="Admin / Audit Logs"
                icon={<svg viewBox="0 0 24 24" fill="none"><path d="M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7l3-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              />
            </div>
          </nav>
        </div>

          <div className="px-3 pb-4">
          <div className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-[var(--app-soft)]">
            <div className="flex-1 text-sm">
              <div className="font-semibold text-[var(--app-text)] dark:text-white">{user.username || "User"}</div>
              <div className="text-xs text-slate-500 dark:text-slate-300">{user.isAdmin ? "Administrator" : "Trader"}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button type="button" onClick={toggleTheme} className="btn-ghost text-sm">{theme === "dark" ? "☀️" : "🌙"}</button>
              <button type="button" onClick={onLogout} className="btn-ghost text-sm">Sign out</button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

NavItem.propTypes = {
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
};

NavItem.defaultProps = {
  active: false,
  icon: null,
};

Sidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  openAuditLogs: PropTypes.func.isRequired,
  toggleTheme: PropTypes.func.isRequired,
  user: PropTypes.shape({ username: PropTypes.string, isAdmin: PropTypes.bool }).isRequired,
  theme: PropTypes.oneOf(["dark", "light"]).isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default Sidebar;
