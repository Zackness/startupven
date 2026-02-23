import { MOCK_PROYECTOS } from "../_components/escritorio-mock-data";
import { ProyectoFacturaRow } from "./_components/proyecto-factura-row";

export default function ProyectosPage() {
  return (
    <div className="space-y-12 sm:space-y-14">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Proyectos
        </h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
          Facturación de proyectos, mensualidades de servidor y servicios. Haz clic en una fila para ver el detalle.
        </p>
      </section>

      <section className="space-y-4">
        {MOCK_PROYECTOS.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-8 py-16 text-center">
            <p className="text-[15px] text-[var(--muted-foreground)]">
              No hay proyectos o facturas registrados.
            </p>
          </div>
        ) : (
          MOCK_PROYECTOS.map((proyecto) => (
            <ProyectoFacturaRow key={proyecto.id} proyecto={proyecto} />
          ))
        )}
      </section>
    </div>
  );
}
