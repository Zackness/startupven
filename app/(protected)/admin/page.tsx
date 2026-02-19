import { getAdminStats } from "@/lib/actions/tickets";
import { ADMIN_PATH } from "@/routes";
import { Ticket, CalendarDays, UtensilsCrossed, ShoppingCart } from "lucide-react";
import { BarChart, PieChart } from "./admin-charts";
import { AdminChartPeriodLinks } from "./admin-chart-period-links";

const MONTH_NAMES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatChartLabel(dateStr: string) {
  const [y, m, day] = dateStr.split("-").map(Number);
  return `${day} ${MONTH_NAMES[m - 1]}`;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ grafico?: string }>;
}) {
  const stats = await getAdminStats();
  const grafico = (await searchParams).grafico ?? "7d";
  const useMonth = grafico === "mes";

  const chartData = useMonth ? stats.ticketsThisMonthBySale : stats.ticketsLast7DaysBySale;
  const chartTitle = useMonth
    ? "Ventas por día (este mes)"
    : "Ventas por día (últimos 7 días)";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">
          Panel de administración
        </h1>
        <p className="mt-1 text-zinc-600">
          Comedor universitario — venta y control de tickets
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-zinc-100 p-2">
              <Ticket className="h-6 w-6 text-black" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">Total tickets</p>
              <p className="text-2xl font-bold text-black">{stats.totalTickets}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <ShoppingCart className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">Ventas hoy</p>
              <p className="text-2xl font-bold text-black">{stats.salesToday}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <CalendarDays className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">Tickets menú hoy</p>
              <p className="text-2xl font-bold text-black">{stats.ticketsTodayMenu}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <UtensilsCrossed className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">Platos activos</p>
              <p className="text-2xl font-bold text-black">{stats.ticketTypesCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-600">Total usuarios</p>
          <p className="mt-1 text-3xl font-bold text-black">{stats.totalUsers}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600">
            {stats.usersByRole.map((r) => (
              <span key={r.role} className="rounded-full bg-zinc-100 px-2 py-1">
                {r.role}: <span className="font-semibold text-black">{r.count}</span>
              </span>
            ))}
          </div>
        </div>

        <PieChart
          title="Estado de tickets"
          data={[
            { label: "Pendiente pago", value: stats.ticketsPendingPayment, color: "#f59e0b" },
            { label: "Canjeado", value: stats.ticketsRedeemed, color: "#16a34a" },
            { label: "Vencido", value: stats.ticketsExpired, color: "#dc2626" },
            { label: "Disponible", value: stats.ticketsAvailable, color: "#2563eb" },
          ]}
          className="lg:col-span-1"
        />

        <div className="lg:col-span-1 space-y-2">
          <AdminChartPeriodLinks current={grafico} />
          <BarChart
            title={chartTitle}
            data={chartData.map((d) => ({
              label: formatChartLabel(d.date),
              value: d.count,
            }))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
