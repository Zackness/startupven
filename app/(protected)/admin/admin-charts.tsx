import { cn } from "@/lib/utils";

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angle = ((angleDeg - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export function PieChart(props: {
  title: string;
  data: { label: string; value: number; color: string }[];
  className?: string;
}) {
  const total = props.data.reduce((acc, d) => acc + d.value, 0);
  const hasData = total > 0;
  const totalForAngle = total || 1;
  let angle = 0;

  return (
    <div className={cn("", props.className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">{props.title}</h2>
        <span className="text-xs text-[var(--muted-foreground)]">Total: {total}</span>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-[160px_1fr] sm:items-center">
        <svg width="160" height="160" viewBox="0 0 160 160" role="img" aria-label={props.title}>
          <circle cx="80" cy="80" r="76" className="fill-[var(--muted)]" />
          {hasData &&
            props.data.map((d) => {
              const start = angle;
              const slice = (d.value / totalForAngle) * 360;
              const end = angle + slice;
              angle = end;
              if (d.value <= 0) return null;
              return <path key={d.label} d={describeArc(80, 80, 76, start, end)} fill={d.color} />;
            })}
          <circle cx="80" cy="80" r="46" className="fill-[var(--card)]" />
        </svg>

        <div className="space-y-2">
          {props.data.map((d) => (
            <div key={d.label} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[var(--foreground)]">{d.label}</span>
              </div>
              <span className="font-medium tabular-nums text-[var(--foreground)]">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BarChart(props: {
  title: string;
  data: { label: string; value: number }[];
  className?: string;
}) {
  const max = Math.max(1, ...props.data.map((d) => d.value));
  const hasAnyValue = props.data.some((d) => d.value > 0);

  return (
    <div className={cn("rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8", props.className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">{props.title}</h2>
        <span className="text-xs text-[var(--muted-foreground)]">
          {props.data.length === 0 ? "Sin datos" : hasAnyValue ? `Máx: ${max}` : "Máx: 0"}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div
          className="flex h-44 min-w-0 items-end gap-1"
          style={props.data.length > 14 ? { minWidth: props.data.length * 24 } : undefined}
        >
          {props.data.length === 0 ? (
            <p className="flex w-full items-center justify-center text-sm text-[var(--muted-foreground)]">Sin datos</p>
          ) : (
            props.data.map((d, i) => {
              const h = Math.round((d.value / max) * 100);
              const step = props.data.length <= 14 ? 1 : Math.max(1, Math.floor(props.data.length / 14));
              const showLabel = i % step === 0 || i === props.data.length - 1;
              return (
                <div key={`${d.label}-${i}`} className="flex min-w-[20px] flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full min-h-[2px] rounded-md bg-[var(--foreground)]/80"
                      style={{ height: `${h}%` }}
                      title={`${d.label}: ${d.value}`}
                    />
                  </div>
                  {showLabel && (
                    <div className="text-center text-[10px] leading-tight text-[var(--muted-foreground)] truncate max-w-full">
                      {d.label}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

