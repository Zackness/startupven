"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function EditorTicketFilters(props: {
  initial: { cedula?: string; fecha?: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialCedula = searchParams.get("cedula") ?? props.initial.cedula ?? "";
  const initialFecha = searchParams.get("fecha") ?? props.initial.fecha ?? "";

  const [cedula, setCedula] = useState(initialCedula);
  const [fecha, setFecha] = useState(initialFecha);

  useEffect(() => {
    setCedula(initialCedula);
    setFecha(initialFecha);
  }, [initialCedula, initialFecha]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams();
    next.set("page", "0");
    if (cedula.trim()) next.set("cedula", cedula.trim());
    if (fecha) next.set("fecha", fecha);
    router.push(next.toString() ? `${pathname}?${next.toString()}` : pathname);
  }

  function clearFilters() {
    setCedula("");
    setFecha("");
    router.push(pathname);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <label className="text-sm font-medium text-black">Cédula</label>
        <Input
          type="text"
          placeholder="Buscar por cédula"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          className="border-zinc-300 bg-white text-black"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-black">Fecha menú</label>
        <Input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border-zinc-300 bg-white text-black"
        />
      </div>
      <div className="flex items-end gap-2">
        <Button type="submit" variant="outline" size="sm">
          Filtrar
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
          Limpiar
        </Button>
      </div>
    </form>
  );
}
