
import { useState } from "react";
import { Icon, Mark } from "./Icon";
import {
  DEMO_ACCOUNTS,
  DEMO_MODE,
  DEMO_PASSWORD,
  ROLE_LABEL,
  initials,
} from "./roles";

const NAV = {
  chat: { label: "HR Assistant", icon: "message" },
};

export default function Sidebar({
  session,
  views,
  active,
  onNavigate,
  onSignOut,
  onSwitch,
}) {
  const { user, profile } = session;

  const name = profile?.name ?? user.username;
  const subtitle = profile
    ? `${profile.title}, ${profile.department}`
    : "";

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function switchTo(username) {
    setError("");
    setBusy(username);

    try {
      await onSwitch(username, DEMO_PASSWORD);
      setOpen(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <Mark size={26} />
        <span className="wordmark">SecureHR</span>
      </div>

      <nav className="nav" aria-label="Main navigation">
        {views
          .filter((view) => NAV[view])
          .map((view) => (
            <button
              key={view}
              className={
                "nav-btn" + (view === active ? " active" : "")
              }
              aria-current={view === active ? "page" : undefined}
              onClick={() => onNavigate(view)}
            >
              <Icon name={NAV[view].icon} />
              <span className="label">{NAV[view].label}</span>
            </button>
          ))}
      </nav>

      <div className="spacer" />

      {open && (
        <div
          className="switch-list"
          role="group"
          aria-label="Switch user"
        >
          {DEMO_ACCOUNTS
            .filter((account) => account.username !== user.username)
            .map((account) => (
              <button
                key={account.username}
                disabled={Boolean(busy)}
                onClick={() => switchTo(account.username)}
              >
                <span className="avatar sm">
                  {initials(account.name)}
                </span>

                <span>
                  {busy === account.username
                    ? "Signing in..."
                    : account.name}
                  <small>{ROLE_LABEL[account.role]}</small>
                </span>
              </button>
            ))}

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>
      )}

      <div className="user">
        <span className="avatar">{initials(name)}</span>

        <div className="user-meta">
          <strong>{name}</strong>

          {subtitle && (
            <span className="sub">{subtitle}</span>
          )}

          <span className="role-pill">
            {ROLE_LABEL[user.role] ?? user.role}
          </span>
        </div>
      </div>

      <div className="user-actions">
        {DEMO_MODE && (
          <button
            className="btn btn-quiet switch-btn"
            aria-expanded={open}
            onClick={() => setOpen((previous) => !previous)}
          >
            <Icon name="users" size={16} />
            <span className="label">Switch user</span>
          </button>
        )}

        <button
          className="btn btn-quiet"
          onClick={onSignOut}
          aria-label="Sign out"
        >
          <Icon name="logout" size={16} />
          <span className="label">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
