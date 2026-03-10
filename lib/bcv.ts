/**
 * Tasa de cambio USD → Bs (VES) para mostrar totales en bolívares.
 *
 * Configuración en .env:
 *
 * Opción 1 – DolarAPI Venezuela (https://dolarapi.com/docs/venezuela/):
 * - DOLARAPI_BASE_URL: Base URL (ej. https://ve.dolarapi.com). Sin clave.
 * - DOLARAPI_TASA: "paralelo" (recomendado) u "oficial".
 *
 * Opción 2 – Otro API:
 * - BCV_API_URL: URL que devuelva JSON con tasa (ej. { "tasa": 36.5 } o { "rate": 36.5 }).
 * - BCV_API_KEY: (opcional) Si el API requiere Authorization.
 *
 * Fallback:
 * - FALLBACK_USD_VES_RATE: Número. Se usa si el API falla o no está configurado.
 */

const DOLARAPI_BASE_URL = process.env.DOLARAPI_BASE_URL?.trim();
const DOLARAPI_TASA = (process.env.DOLARAPI_TASA?.trim() || "paralelo").toLowerCase();
const BCV_API_URL = process.env.BCV_API_URL?.trim();
const BCV_API_KEY = process.env.BCV_API_KEY?.trim();
const FALLBACK_USD_VES_RATE = process.env.FALLBACK_USD_VES_RATE
  ? parseFloat(process.env.FALLBACK_USD_VES_RATE)
  : undefined;

type DolarApiItem = {
  fuente?: string;
  nombre?: string;
  compra?: number | null;
  venta?: number | null;
  promedio?: number | null;
  fechaActualizacion?: string;
};

function parseRateFromResponse(data: unknown): number | null {
  if (data == null || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (typeof o.tasa === "number" && o.tasa > 0) return o.tasa;
  if (typeof o.rate === "number" && o.rate > 0) return o.rate;
  if (o.data != null && typeof o.data === "object") {
    const d = o.data as Record<string, unknown>;
    if (typeof d.tasa === "number" && d.tasa > 0) return d.tasa;
    if (typeof d.rate === "number" && d.rate > 0) return d.rate;
  }
  return null;
}

/** Obtiene la tasa desde DolarAPI (array de cotizaciones). */
async function getRateFromDolarApi(): Promise<number | null> {
  if (!DOLARAPI_BASE_URL) return null;
  const url = `${DOLARAPI_BASE_URL}/v1/dolares`;
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`DolarAPI ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) return null;
    const item = (data as DolarApiItem[]).find(
      (d) => d.fuente?.toLowerCase() === DOLARAPI_TASA || d.nombre?.toLowerCase() === DOLARAPI_TASA
    );
    const rate = item?.promedio ?? item?.venta ?? item?.compra;
    if (typeof rate === "number" && rate > 0) return rate;
    const first = data[0] as DolarApiItem | undefined;
    const fallbackRate = first?.promedio ?? first?.venta ?? first?.compra;
    return typeof fallbackRate === "number" && fallbackRate > 0 ? fallbackRate : null;
  } catch {
    return null;
  }
}

/**
 * Obtiene la tasa USD → VES (bolívares). Prioridad: DolarAPI si está configurado, luego BCV_API_URL, luego FALLBACK_USD_VES_RATE.
 */
export async function getUsdToVesRate(): Promise<number | null> {
  const fromDolarApi = await getRateFromDolarApi();
  if (fromDolarApi != null) return fromDolarApi;

  if (BCV_API_URL) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (BCV_API_KEY?.trim()) {
        headers["Authorization"] = BCV_API_KEY.trim();
      }
      const res = await fetch(BCV_API_URL, {
        headers,
        next: { revalidate: 3600 },
      });
      if (!res.ok) throw new Error(`BCV API ${res.status}`);
      const data = await res.json();
      const rate = parseRateFromResponse(data);
      if (rate != null) return rate;
    } catch {
      // Fall through to fallback
    }
  }

  if (typeof FALLBACK_USD_VES_RATE === "number" && FALLBACK_USD_VES_RATE > 0) {
    return FALLBACK_USD_VES_RATE;
  }
  return null;
}
