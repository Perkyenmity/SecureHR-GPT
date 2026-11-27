
import { useState } from "react";
import { Mark } from "./Icon";
import {
  DEMO_ACCOUNTS,
  DEMO_MODE,
  DEMO_PASSWORD,
  ROLE_LABEL,
  initials,
} from "./roles";

const PATH = [
  ["Sign in", "Your token carries your role into every request."],
  ["Scan the question", "Attempts to instruct the model are stopped here."],
  ["Fetch permitted data only", "Records and documents outside your role are never retrieved."],
  ["Generate the answer", "The model only sees what you’re cleared for."],
  ["Check and record", "The reply is screened and the request is logged."],
];

export default function Login({ onSignIn, notice }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function attempt(u, p, key) {
    setError("");
    setBusy(key);

    try {
      await onSignIn(u, p);
    } catch (e) {
      setError(e.message || "Login failed. Please try again.");
      setBusy("");
    }
  }

  function submit(e) {
    e.preventDefault();

    if (username.trim() && password && !busy) {
      attempt(username.trim(), password, "form");
    }
  }

  return (
    <div className="login">
      <section className="login-art">
        <div className="login-brand">
          <Mark size={28} light />
          <span className="wordmark">SecureHR</span>
        </div>

        <div className="login-copy">
          <h1>
            Ask HR anything. The AI only knows what you’re cleared to see.
          </h1>

          <p>
            Permissions are enforced in code before the model sees any data,
            so a clever prompt has nothing to leak.
          </p>

          <ol className="path">
            {PATH.map(([title, text], i) => (
              <li key={title} style={{ "--i": i }}>
                <span className="path-n">{i + 1}</span>
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="login-panel">
        <form className="login-form" onSubmit={submit}>
          <h2>Sign in</h2>

          {notice && (
            <p className="form-note" role="status">
              {notice}
            </p>
          )}

          <label className="field">
            <span>Username</span>
            <input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              autoFocus
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={!username.trim() || !password || Boolean(busy)}
          >
            {busy === "form" ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {DEMO_MODE && (
          <div className="demo">
            <h3>Demo accounts</h3>

            <div className="demo-grid">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.username}
                  type="button"
                  className="demo-btn"
                  disabled={Boolean(busy)}
                  onClick={() =>
                    attempt(a.username, DEMO_PASSWORD, a.username)
                  }
                >
                  <span className="avatar sm">{initials(a.name)}</span>

                  <span className="demo-text">
                    <strong>
                      {busy === a.username ? "Signing in…" : a.name}
                    </strong>
                    <span>{ROLE_LABEL[a.role]}</span>
                  </span>
                </button>
              ))}
            </div>

            <p className="demo-hint">
              Every demo account uses the password {DEMO_PASSWORD}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
