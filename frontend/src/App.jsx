import { useCallback, useEffect, useState } from "react";
import { api, setUnauthorizedHandler, tokenStore } from "./api";
import { VIEWS_BY_ROLE } from "./roles";
import { Mark } from "./Icon";
import { useChat } from "./useChat";
import Login from "./Login";
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import Documents from "./Documents";
import AuditLog from "./AuditLog";

export default function App() {
  const [session, setSession] = useState(null); // { user, profile }
  const [booting, setBooting] = useState(() => Boolean(tokenStore.get()));
  const [view, setView] = useState("chat");
  const [notice, setNotice] = useState("");
  const chat = useChat();
  const resetChat = chat.reset;

  const signOut = useCallback(
    (message = "") => {
      tokenStore.clear();
      setSession(null);
      setView("chat");
      resetChat();
      setNotice(message);
    },
    [resetChat]
  );

  const loadSession = useCallback(async () => {
    const user = await api.me();
    let profile = null;
    try {
      profile = await api.employee(user.employee_id); // everyone may read their own record
    } catch {
      /* the name is cosmetic; fall back to the username */
    }
    setSession({ user, profile });
  }, []);

  // Any 401 from the API sends the person back to the login screen.
  useEffect(() => {
    setUnauthorizedHandler(() => signOut("Your session expired. Sign in again."));
  }, [signOut]);

  // Restore a session after a page refresh.
  useEffect(() => {
    if (!tokenStore.get()) return;
    loadSession()
      .catch(() => tokenStore.clear())
      .finally(() => setBooting(false));
  }, [loadSession]);

  // Also used by "Switch user": a failed login leaves the current session untouched.
  const signIn = useCallback(
    async (username, password) => {
      const { access_token } = await api.login(username, password);
      tokenStore.set(access_token);
      try {
        await loadSession();
      } catch (e) {
        tokenStore.clear();
        throw e;
      }
      resetChat();
      setView("chat");
      setNotice("");
    },
    [loadSession, resetChat]
  );

  if (booting) {
    return (
      <div className="boot" aria-busy="true" aria-label="Loading">
        <Mark size={36} />
      </div>
    );
  }
  if (!session) return <Login onSignIn={signIn} notice={notice} />;

  const views = VIEWS_BY_ROLE[session.user.role] ?? ["chat"];
  const active = views.includes(view) ? view : "chat";

  return (
    <div className="shell">
      <Sidebar
        session={session}
        views={views}
        active={active}
        onNavigate={setView}
        onSignOut={() => signOut()}
        onSwitch={signIn}
      />
      <main className="stage">
        {active === "chat" && <Chat session={session} chat={chat} />}
        {active === "documents" && <Documents />}
        {active === "audit" && <AuditLog />}
      </main>
    </div>
  );
}
