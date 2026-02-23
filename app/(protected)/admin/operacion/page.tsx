import { Link } from "@/components/link";
import { ADMIN_PATH, VENDEDOR_PATH } from "@/routes";
import { Ticket, ShoppingCart, ClipboardList, QrCode, UtensilsCrossed, ArrowRight } from "lucide-react";

const ventasItems = [
  { href: `${ADMIN_PATH}/tickets`, label: "Tickets vendidos", desc: "Listado, estado de canje y pago", icon: Ticket },
  { href: `${ADMIN_PATH}/ventas-pendientes`, label: "Ventas pendientes", desc: "Aprobar y registrar ventas manuales", icon: ClipboardList },
  { href: VENDEDOR_PATH, label: "Vender", desc: "Registrar venta de tickets en punto de venta", icon: ShoppingCart },
] as const;

const canjeMenuItems = [
  { href: `${ADMIN_PATH}/escaneo`, label: "Escanear QR", desc: "Validar y marcar tickets como canjeados", icon: QrCode },
  { href: `${ADMIN_PATH}/almuerzos`, label: "Platos", desc: "Tipos de menú, fechas y activación", icon: UtensilsCrossed },
] as const;

function OperacionCard({
  href,
  label,
  desc,
  icon: Icon,
}: {
  href: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm sm:p-8"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-[var(--muted)] p-3">
          <Icon className="h-6 w-6 text-[var(--foreground)]" />
        </div>
        <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="mt-6">
        <p className="font-semibold text-[var(--foreground)]">{label}</p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{desc}</p>
      </div>
    </Link>
  );
}

export default function AdminOperacionPage() {
  return (
    <div className="space-y-12 sm:space-y-14">
      <section>
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Operación del sistema</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">Operación</h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
          Gestión de tickets, ventas, escaneo y menú. Acceso a las herramientas operativas del sistema.
        </p>
      </section>

      <section>
        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Ventas y tickets</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ventasItems.map((item) => (
            <OperacionCard key={item.href} href={item.href} label={item.label} desc={item.desc} icon={item.icon} />
          ))}
        </div>
      </section>

      <section>
        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Canje y menú</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {canjeMenuItems.map((item) => (
            <OperacionCard key={item.href} href={item.href} label={item.label} desc={item.desc} icon={item.icon} />
          ))}
        </div>
      </section>
    </div>
  );
}
