type Point = { label: string; value: number };

type BarProps = {
  data: Point[];
  height?: number;
  formatValue?: (n: number) => string;
};

export function AdminBarChart({ data, height = 220, formatValue }: BarProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const pad = 28;
  const w = Math.max(320, data.length * 56);
  const innerH = height - pad * 2;
  const barW = Math.min(36, (w - pad * 2) / Math.max(1, data.length) - 12);

  return (
    <div className="admin-chart-scroll">
      <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} role="img" aria-label="Bar chart">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = pad + innerH * (1 - t);
          return (
            <g key={t}>
              <line x1={pad} x2={w - 8} y1={y} y2={y} stroke="#e3ebe4" strokeWidth={1} />
              <text x={4} y={y + 4} fontSize={10} fill="#6b7c70">
                {formatValue ? formatValue(max * t) : Math.round(max * t)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const x =
            pad +
            i * ((w - pad * 2) / Math.max(1, data.length)) +
            ((w - pad * 2) / Math.max(1, data.length) - barW) / 2;
          const h = (d.value / max) * innerH;
          const y = pad + innerH - h;
          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(2, h)}
                rx={6}
                fill="url(#adminBarGrad)"
              />
              <text
                x={x + barW / 2}
                y={height - 8}
                textAnchor="middle"
                fontSize={10}
                fill="#546e5a"
              >
                {d.label.length > 8 ? `${d.label.slice(0, 7)}…` : d.label}
              </text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="adminBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#43a047" />
            <stop offset="100%" stopColor="#1b5e20" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

type DonutProps = {
  segments: Array<{ label: string; value: number; color: string }>;
  centerLabel?: string;
  centerValue?: string;
};

export function AdminDonutChart({ segments, centerLabel, centerValue }: DonutProps) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 54;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="admin-donut-wrap">
      <svg width={160} height={160} viewBox="0 0 160 160" role="img" aria-label="Donut chart">
        <g transform="translate(80 80) rotate(-90)">
          {segments.map((seg) => {
            const len = (seg.value / total) * c;
            const el = (
              <circle
                key={seg.label}
                r={r}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={18}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return el;
          })}
        </g>
        <circle cx={80} cy={80} r={38} fill="#fff" />
        {centerValue ? (
          <text x={80} y={76} textAnchor="middle" fontSize={13} fontWeight={700} fill="#122016">
            {centerValue}
          </text>
        ) : null}
        {centerLabel ? (
          <text x={80} y={94} textAnchor="middle" fontSize={10} fill="#6b7c70">
            {centerLabel}
          </text>
        ) : null}
      </svg>
      <ul className="admin-donut-legend">
        {segments.map((s) => (
          <li key={s.label}>
            <span style={{ background: s.color }} />
            <div>
              <strong>{s.label}</strong>
              <em>{Math.round((s.value / total) * 100)}%</em>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
