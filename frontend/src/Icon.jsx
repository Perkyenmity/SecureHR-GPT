const PATHS = {
  shield: ["M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z"],
  "shield-alert": ["M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z", "M12 8.5v4", "M12 15.5h.01"],
  lock: ["M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z", "M8 11V8a4 4 0 0 1 8 0v3"],
  send: ["M22 2L11 13", "M22 2l-7 20-4-9-9-4 20-7z"],
  message: ["M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"],
  file: ["M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z", "M14 3v5h5"],
  list: ["M8 6h13", "M8 12h13", "M8 18h13", "M3 6h.01", "M3 12h.01", "M3 18h.01"],
  upload: ["M12 16V4", "M7 9l5-5 5 5", "M5 20h14"],
  check: ["M5 12l5 5L20 7"],
  x: ["M6 6l12 12", "M18 6L6 18"],
  refresh: ["M20 11a8 8 0 1 0-2.3 5.7", "M20 4v7h-7"],
  logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  users: [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    "M22 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  eraser: ["M3 6h18", "M8 6V4h8v2", "M6 6l1 14h10l1-14"],
  alert: [
    "M12 9v4",
    "M12 17h.01",
    "M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  ],
};

export function Icon({ name, size = 18 }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {(PATHS[name] ?? []).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function Mark({ size = 28, light = false }) {
  const body = light ? "#8fe0c8" : "var(--pine)";
  const key = light ? "#0a2f27" : "var(--on-pine)";
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 3l11 4.5v8c0 6.5-4.6 11.2-11 13.5C9.6 26.7 5 22 5 15.5v-8L16 3z" style={{ fill: body }} />
      <circle cx="16" cy="14" r="2.6" style={{ fill: key }} />
      <path d="M16 15.5v4.5" style={{ stroke: key }} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
