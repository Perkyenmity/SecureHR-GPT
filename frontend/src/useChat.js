import { useCallback, useRef, useState } from "react";
import { api } from "./api";

// The backend returns plain refusals (blocked: false) when RBAC leaves nothing
// to answer from. Treat those as "restricted" so the UI can tell them apart
// from a guardrail block.
const RESTRICTED = /not authori[sz]ed|(?:don['’]t|do not) have access/i;

function classify(r) {
  if (r.blocked) return "blocked";
  if (RESTRICTED.test(r.answer)) return "restricted";
  return "ok";
}

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const seq = useRef(0);
  const busy = useRef(false);
  const epoch = useRef(0); // bumps on reset so a late reply never lands in another user's chat

  const send = useCallback(async (text) => {
    const question = text.trim();
    if (!question || busy.current) return;
    const mine = epoch.current;
    busy.current = true;
    setPending(true);
    setMessages((m) => [...m, { id: ++seq.current, role: "user", text: question }]);
    try {
      const r = await api.chat(question);
      if (mine !== epoch.current) return;
      setMessages((m) => [
        ...m,
        { id: ++seq.current, role: "assistant", text: r.answer, sources: r.sources ?? [], status: classify(r) },
      ]);
    } catch (e) {
      if (mine !== epoch.current) return;
      setMessages((m) => [...m, { id: ++seq.current, role: "assistant", text: e.message, status: "error" }]);
    } finally {
      if (mine === epoch.current) {
        busy.current = false;
        setPending(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    epoch.current += 1;
    busy.current = false;
    setMessages([]);
    setPending(false);
  }, []);

  return { messages, pending, send, reset };
}
