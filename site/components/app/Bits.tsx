import ReconlyMark from "@/components/ReconlyMark";

export function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="glass light-seam rounded-xl p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#6B7280]">{label}</p>
      <p className="mt-2 text-2xl font-medium text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-[#9CA3AF]">{sub}</p>}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass flex flex-col items-center rounded-xl px-6 py-14 text-center">
      <div className="opacity-50">
        <ReconlyMark size={56} />
      </div>
      <p className="mt-5 text-sm font-medium text-white">{title}</p>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#6B7280]">{hint}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LineChart({
  data,
  label,
}: {
  data: { date: string; value: number }[];
  label: string;
}) {
  const w = 640;
  const h = 140;
  if (data.length < 2) return null;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values, min + 1);
  const step = w / (data.length - 1);
  const y = (v: number) => h - 8 - ((v - min) / (max - min)) * (h - 24);
  const points = data.map((d, i) => `${(i * step).toFixed(1)},${y(d.value).toFixed(1)}`);
  const line = `M${points.join(" L")}`;
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={label}>
      <defs>
        <linearGradient id="lc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.14" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" y1={h * f} x2={w} y2={h * f} stroke="white" strokeOpacity="0.06" strokeDasharray="3 5" />
      ))}
      <path d={area} fill="url(#lc)" />
      <path d={line} fill="none" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function SeverityDot({ severity }: { severity: "info" | "warning" | "critical" }) {
  const cls =
    severity === "critical"
      ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
      : severity === "warning"
        ? "bg-white/60"
        : "bg-white/30";
  return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${cls}`} aria-hidden="true" />;
}

export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "unreviewed"
      ? "border-white/15 text-[#9CA3AF]"
      : status === "flagged"
        ? "border-white/50 bg-white/10 text-white"
        : "border-white/25 text-white";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] capitalize ${cls}`}>{status}</span>
  );
}
