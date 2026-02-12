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
    <div className={cn("rounded-xl border border-zinc-200 bg-white p-6", props.className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-black">{props.title}</h2>
        <span className="text-xs text-zinc-600">Total: {total}</span>
      </div>

      <div className="mt-4 grid gap-6 sm:grid-cols-[160px_1fr] sm:items-center">
        <svg width="160" height="160" viewBox="0 0 160 160" role="img" aria-label={props.title}>
          <circle cx="80" cy="80" r="76" fill="#f4f4f5" />
          {hasData &&
            props.data.map((d) => {
              const start = angle;
              const slice = (d.value / totalForAngle) * 360;
              const end = angle + slice;
              angle = end;
              if (d.value <= 0) return null;
              return <path key={d.label} d={describeArc(80, 80, 76, start, end)} fill={d.color} />;
            })}
          <circle cx="80" cy="80" r="46" fill="white" />
        </svg>

        <div className="space-y-2">
          {props.data.map((d) => (
            <div key={d.label} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-zinc-700">{d.label}</span>
              </div>
              <span className="font-medium text-black">{d.value}</span>
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
    <div className={cn("rounded-xl border border-zinc-200 bg-white p-6", props.className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-black">{props.title}</h2>
        <span className="text-xs text-zinc-600">
          {props.data.length === 0 ? "Sin datos" : hasAnyValue ? `Máx: ${max}` : "Máx: 0"}
        </span>
      </div>

      <div className="mt-4 flex h-44 items-end gap-2">
        {props.data.length === 0 ? (
          <p className="flex w-full items-center justify-center text-sm text-zinc-500">Sin datos</p>
        ) : (
          props.data.map((d) => {
            const h = Math.round((d.value / max) * 100);
            return (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full min-h-[2px] rounded-md bg-black/80"
                    style={{ height: `${h}%` }}
                    title={`${d.label}: ${d.value}`}
                  />
                </div>
                <div className="text-center text-[11px] leading-tight text-zinc-600 truncate max-w-full">
                  {d.label}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

