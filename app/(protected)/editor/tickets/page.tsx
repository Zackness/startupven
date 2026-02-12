import { redirect } from "next/navigation";

/**
 * Aprobar compras está en el panel principal del editor (/editor).
 */
export default async function EditorTicketsRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = new URLSearchParams();
  if (params.page && typeof params.page === "string") q.set("page", params.page);
  if (params.cedula && typeof params.cedula === "string") q.set("cedula", params.cedula);
  if (params.fecha && typeof params.fecha === "string") q.set("fecha", params.fecha);
  const query = q.toString();
  redirect(`/editor${query ? `?${query}` : ""}`);
}
