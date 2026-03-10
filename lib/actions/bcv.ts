"use server";

import { getUsdToVesRate } from "@/lib/bcv";

/** Obtiene la tasa USD → Bs (BCV) para mostrar el total en bolívares. Usar en onboarding paso de pago. */
export async function getBcvUsdToVesRate(): Promise<number | null> {
  return getUsdToVesRate();
}
