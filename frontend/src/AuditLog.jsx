import { useEffect, useState } from "react";
import { api } from "./api";
import { Icon } from "./Icon";

const FILTERS = [
  ["", "All"],
  ["ALLOWED", "Allowed"],
  ["BLOCKED", "Blocked"],
];

// The API sends naive UTC timestamps; mark them as UTC so they show in local time.
function formatTime(ts) {
  if (!ts) return "";
  let s = String(ts).replace(/(\.\d{3})\d+/, "$1");
  if (!/(?:Z|[+-]\d\d:?\d\d)$/i.test(s)) s += "Z";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AuditLog() {
  const [filter, setFilter] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    api
      .auditLogs({ decision: filter, limit: 100 })
      .then((d) => live && setRows(d))
      .catch((e) => live && setError(e.message))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [filter, tick]);

  const blocked = rows.filter((r) => r.decision === "BLOCKED").length;

  return (
    <section className="page wide" aria-label="Audit log">
      <header className="page-head">
        <h1>Audit log</h1>
        <p>Every request is recorded here, whether it was answered or blocked.</p>
      </header>

      <div className="toolbar">
        <div className="segmented" role="group" aria-label="Filter by decision">
          {FILTERS.map(([value, label]) => (
            <button key={label} aria-pressed={filter === value} onClick={() => setFilter(value)}>
              {label}
            </button>
          ))}
        </div>
        <span className="summary">
          {error ? "" : `Showing ${rows.length} ${rows.length === 1 ? "entry" : "entries"}, ${blocked} blocked`}
        </span>
        <button className="btn btn-line" onClick={() => setTick((t) => t + 1)} disabled={loading}>
          <Icon name="refresh" size={16} />
          <span>{loading ? "Loading…" : "Refresh"}</span>
        </button>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {!error && (
        <div className={"table-wrap" + (loading ? " loading" : "")}>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Request</th>
                <th>Decision</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={r.decision === "BLOCKED" ? "blocked" : ""}>
                  <td className="time">{formatTime(r.time)}</td>
                  <td>{r.user}</td>
                  <td className="query" title={r.query}>
                    {r.query}
                  </td>
                  <td>
                    <span className={`badge ${String(r.decision).toLowerCase()}`}>
                      {r.decision === "BLOCKED" ? "Blocked" : "Allowed"}
                    </span>
                  </td>
                  <td className="reason">{r.reason || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && rows.length === 0 && (
            <p className="table-empty">
              No entries yet. Requests appear here as soon as someone uses the assistant.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
