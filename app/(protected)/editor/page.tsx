import Link from "next/link";
import { ADMIN_PATH, EDITOR_PATH, ESCRITORIO_PATH } from "@/routes";
import { Button } from "@/components/ui/button";

export default async function EditorPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">Panel de editor</h1>
        <p className="mt-1 text-zinc-600">Herramientas para edición/gestión de contenido.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-600">Accesos rápidos</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={ESCRITORIO_PATH}>
              <Button variant="outline" size="sm">
                Ir a escritorio
              </Button>
            </Link>
            <Link href={EDITOR_PATH}>
              <Button size="sm" className="bg-black text-white hover:bg-zinc-800">
                Panel editor
              </Button>
            </Link>
            <Link href={ADMIN_PATH}>
              <Button variant="outline" size="sm">
                Panel admin
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6">
          <p className="text-sm text-zinc-700">
            Aquí podemos agregar luego funcionalidades del editor (por ejemplo: gestionar blog, anuncios, páginas, etc.).
          </p>
        </div>
      </div>
    </div>
  );
}

