import { getAdminStats } from "@/lib/actions/tickets";
import Link from "next/link";
import { ADMIN_PATH } from "@/routes";
import { Button } from "@/components/ui/button";
import { Ticket, CalendarDays, UtensilsCrossed } from "lucide-react";
import { BarChart, PieChart } from "./admin-charts";

export default async function AdminPage() {
  const stats = await getAdminStats();

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

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm ">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-zinc-100 p-2">
              <Ticket className="h-6 w-6 text-black" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">
                Total tickets
              </p>
              <p className="text-2xl font-bold text-black">
                {stats.totalTickets}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm ">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <CalendarDays className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">
                Tickets hoy
              </p>
              <p className="text-2xl font-bold text-black">
                {stats.ticketsToday}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm ">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <UtensilsCrossed className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">
                Tipos activos
              </p>
              <p className="text-2xl font-bold text-black">
                {stats.ticketTypesCount}
              </p>
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
            { label: "Pendiente", value: stats.ticketsPendingPayment, color: "#f59e0b" }, // Amber-500
            { label: "Canjeado", value: stats.ticketsRedeemed, color: "#16a34a" }, // Green-600
            { label: "Vencido", value: stats.ticketsExpired, color: "#dc2626" }, // Red-600
            { label: "Disponible", value: stats.ticketsAvailable, color: "#2563eb" }, // Blue-600
          ]}
          className="lg:col-span-1"
        />

        <BarChart
          title="Tickets por fecha menú (últimos 7 días)"
          data={stats.ticketsLast7Days.map((d) => ({
            label: d.date.slice(5), // MM-DD
            value: d.count,
          }))}
          className="lg:col-span-1"
        />
      </div>
    </div>
  );
}
