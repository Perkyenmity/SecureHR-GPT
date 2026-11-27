
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { PROMPTS, ROLE_LABEL, capitalize } from "./roles";

const STAGES = [
  "Checking your question",
  "Checking permitted employee records",
  "Preparing your answer",
];

const STATUS = {
  ok: { label: "Answered within your access", icon: "check" },
  restricted: { label: "Limited by your role", icon: "lock" },
  blocked: { label: "Blocked by security controls", icon: "shield-alert" },
  error: { label: "Could not complete the request", icon: "alert" },
};

const NOTES = {
  restricted: "Your role does not include permission to access the requested information.",
  blocked: "A security control stopped this request. The access attempt was recorded.",
};

const GROUPS = [
  ["ask", "Try asking", null],
  ["deny", "Restricted information examples", "lock"],
  ["attack", "Security checks", "shield-alert"],
];

function inline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
}

function Prose({ text }) {
  const blocks = [];
  let list = null;

  text.split("\n").forEach((line) => {
    const item = line.match(/^\s*([-*•]|\d+\.)\s+(.*)$/);

    if (item) {
      const ordered = /^\d/.test(item[1]);

      if (!list || list.ordered !== ordered) {
        list = { ordered, items: [] };
        blocks.push(list);
      }

      list.items.push(item[2]);
    } else {
      list = null;
      if (line.trim()) blocks.push({ text: line });
    }
  });

  return (
    <div className="prose">
      {blocks.map((block, i) => {
        if (!block.items) {
          return <p key={i}>{inline(block.text)}</p>;
        }

        const Tag = block.ordered ? "ol" : "ul";

        return (
          <Tag key={i}>
            {block.items.map((item, j) => (
              <li key={j}>{inline(item)}</li>
            ))}
          </Tag>
        );
      })}
    </div>
  );
}

function Reply({ m }) {
  const status = STATUS[m.status] ?? STATUS.ok;

  return (
    <article className={`reply ${m.status}`}>
      <header className="reply-status">
        <Icon name={status.icon} size={15} />
        <span>{status.label}</span>
      </header>

      <Prose text={m.text} />

      {NOTES[m.status] && (
        <p className="reply-note">{NOTES[m.status]}</p>
      )}
    </article>
  );
}

function Thinking() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= STAGES.length - 1) return;

    const timer = setTimeout(() => {
      setIndex((current) =>
        Math.min(current + 1, STAGES.length - 1)
      );
    }, 1100);

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className="thinking" role="status">
      <span className="dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>{STAGES[index]}...</span>
    </div>
  );
}

export default function Chat({ session, chat }) {
  const { messages, pending, send, reset } = chat;

  const [text, setText] = useState("");

  const listRef = useRef(null);
  const inputRef = useRef(null);

  const role = session.user.role;

  const first = capitalize(
    (session.profile?.name ?? session.user.username).split(/[\s_]/)[0]
  );

  const prompts = PROMPTS[role] ?? PROMPTS.employee;
  const empty = messages.length === 0 && !pending;

  useEffect(() => {
    const element = inputRef.current;
    if (!element) return;

    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [text]);

  useEffect(() => {
    const element = listRef.current;

    if (element) {
      element.scrollTo({
        top: element.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, pending]);

  function submit(e) {
    e?.preventDefault();

    const question = text.trim();

    if (!question || pending) return;

    setText("");
    send(question);
  }

  function onKeyDown(e) {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing
    ) {
      submit(e);
    }
  }

  return (
    <section className="chat" aria-label="HR Assistant">
      <header className="stage-head">
        <h1>HR Assistant</h1>

        {!empty && (
          <button
            className="btn btn-quiet"
            onClick={reset}
            disabled={pending}
          >
            <Icon name="eraser" size={16} />
            <span>Clear chat</span>
          </button>
        )}
      </header>

      <div className="messages" ref={listRef}>
        <div className="thread" aria-live="polite">
          {empty && (
            <div className="empty">
              <h2>Hi {first}. How can I help you today?</h2>

              <p>
                You are signed in with the{" "}
                {ROLE_LABEL[role] ?? "user"} role. Ask questions
                about employee profiles, salaries, leave balances,
                and performance. Your access permissions are
                automatically enforced.
              </p>

              {GROUPS.map(([key, title, icon]) =>
                prompts[key]?.length ? (
                  <div className="prompt-group" key={key}>
                    <h3>{title}</h3>

                    <div className="chips">
                      {prompts[key].map((prompt) => (
                        <button
                          key={prompt}
                          className={`chip ${key}`}
                          onClick={() => send(prompt)}
                          disabled={pending}
                        >
                          {icon && <Icon name={icon} size={14} />}
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}

          {messages.map((message) =>
            message.role === "user" ? (
              <div className="msg-user" key={message.id}>
                {message.text}
              </div>
            ) : (
              <Reply m={message} key={message.id} />
            )
          )}

          {pending && <Thinking />}
        </div>
      </div>

      <div className="composer-wrap">
        <form className="composer" onSubmit={submit}>
          <textarea
            ref={inputRef}
            rows={1}
            maxLength={1000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about an employee, leave balance, salary..."
            aria-label="Your question"
          />

          <button
            className="send"
            type="submit"
            disabled={!text.trim() || pending}
            aria-label="Send"
          >
            <Icon name="send" size={17} />
          </button>
        </form>

        <p className="hint">
          Enter to send, Shift+Enter for a new line. Access
          attempts are recorded in the audit log.
          {text.length > 800 && (
            <span className="count"> {text.length}/1000</span>
          )}
        </p>
      </div>
    </section>
  );
}
