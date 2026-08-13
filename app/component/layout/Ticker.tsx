export default function Ticker({ items }: { items: string[] }) {
  const loop = [...items, ...items]; // duplicated for seamless scroll
  return (
    <div
      className="overflow-hidden py-3"
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <div
        className="flex whitespace-nowrap"
        style={{ animation: "marquee 22s linear infinite" }}
      >
        {loop.map((item, i) => (
          <span
            key={i}
            className="mono-label px-6"
            style={{ color: "var(--ink-soft)" }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
