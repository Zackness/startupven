import Link from "next/link";
import { ADMIN_PATH } from "@/routes";
import { cn } from "@/lib/utils";

export function AdminChartPeriodLinks({ current }: { current: string }) {
  const base = ADMIN_PATH;
  return (
    <div className="flex gap-2">
      <Link
        href={base}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium",
          current !== "mes"
            ? "bg-black text-white"
            : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
        )}
      >
        Últimos 7 días
      </Link>
      <Link
        href={`${base}?grafico=mes`}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium",
          current === "mes"
            ? "bg-black text-white"
            : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
        )}
      >
        Este mes
      </Link>
    </div>
  );
}
