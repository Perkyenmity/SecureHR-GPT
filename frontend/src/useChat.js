
import { useCallback, useRef, useState } from "react";
import { api } from "./api";

const RESTRICTED =
  /not authori[sz]ed|(?:don't|don’t|do not) have access/i;

function classify(response, answer) {
  if (response?.blocked) return "blocked";
  if (RESTRICTED.test(answer)) return "restricted";
  return "ok";
}

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);

  const seq = useRef(0);
  const busy = useRef(false);
  const epoch = useRef(0);

  const send = useCallback(async (text) => {
    const question = typeof text === "string" ? text.trim() : "";

    if (!question || busy.current) return;

    const requestEpoch = epoch.current;

    busy.current = true;
    setPending(true);

    setMessages((previous) => [
      ...previous,
      {
        id: ++seq.current,
        role: "user",
        text: question,
      },
    ]);

    try {
      const response = await api.chat(question);

      // Ignore responses from a previous session.
      if (requestEpoch !== epoch.current) return;

      const answer =
        typeof response?.answer === "string"
          ? response.answer
          : "The server returned an unexpected response. Please try again.";

      setMessages((previous) => [
        ...previous,
        {
          id: ++seq.current,
          role: "assistant",
          text: answer,
          sources: Array.isArray(response?.sources)
            ? response.sources
            : [],
          status: classify(response, answer),
        },
      ]);
    } catch (error) {
      if (requestEpoch !== epoch.current) return;

      setMessages((previous) => [
        ...previous,
        {
          id: ++seq.current,
          role: "assistant",
          text: error.message || "Something went wrong. Please try again.",
          status: "error",
        },
      ]);
    } finally {
      if (requestEpoch === epoch.current) {
        busy.current = false;
        setPending(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    // Invalidate any outstanding request.
    epoch.current += 1;

    busy.current = false;
    setMessages([]);
    setPending(false);
  }, []);

  return {
    messages,
    pending,
    send,
    reset,
  };
}
