import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

const WORKING_AS_COOKIE = "working-as-user-id";

/**
 * Para APIs del escritorio: si el usuario es EDITOR o ADMIN y tiene la cookie
 * "working-as-user-id", devuelve ese userId (contexto "trabajar como cliente").
 * Si no, devuelve el id del usuario de la sesión.
 * Usa cookies() de next/headers (lee la petición entrante).
 */
export async function getEffectiveUserIdForRequest(): Promise<{
  userId: string;
  role: string | null;
  currentUserId: string;
} | null> {
  const session = await auth();
  const user = session?.user as unknown as { id?: string; role?: string } | null;
  if (!user?.id) return null;

  const role = user.role ?? null;
  const canWorkAs = role === "EDITOR" || role === "ADMIN";

  if (canWorkAs) {
    const cookieStore = await cookies();
    const workingAs = cookieStore.get(WORKING_AS_COOKIE)?.value;
    if (workingAs?.trim()) {
      return { userId: workingAs.trim(), role, currentUserId: user.id };
    }
  }

  return { userId: user.id, role, currentUserId: user.id };
}
