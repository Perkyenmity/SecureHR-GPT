
import { useCallback, useEffect, useState } from "react";
import { api, setUnauthorizedHandler, tokenStore } from "./api";
import { VIEWS_BY_ROLE } from "./roles";
import { Mark } from "./Icon";
import { useChat } from "./useChat";
import Login from "./Login";
import Sidebar from "./Sidebar";
import Chat from "./Chat";

export default function App() {
  const [session, setSession] = useState(null);
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
      profile = await api.employee(user.employee_id);
    } catch {
      // The username can be used if the employee profile is unavailable.
    }

    setSession({ user, profile });
  }, []);

  // Automatically sign out when the backend rejects the JWT.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      signOut("Your session expired. Sign in again.");
    });

    return () => setUnauthorizedHandler(() => {});
  }, [signOut]);

  // Restore an existing session after refreshing the page.
  useEffect(() => {
    if (!tokenStore.get()) {
      setBooting(false);
      return;
    }

    loadSession()
      .catch(() => {
        tokenStore.clear();
        setSession(null);
      })
      .finally(() => setBooting(false));
  }, [loadSession]);

  // Login and account switching.
  const signIn = useCallback(
    async (username, password) => {

      const { access_token } = await api.login(username, password);

      tokenStore.set(access_token);

      try {
        await loadSession();
        resetChat();
        setView("chat");
        setNotice("");
      } catch (error) {
        tokenStore.clear();
        setSession(null);
        throw error;
      }
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

  if (!session) {
    return <Login onSignIn={signIn} notice={notice} />;
  }

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
        {active === "chat" && (
          <Chat session={session} chat={chat} />
        )}
      </main>
    </div>
  );
}
