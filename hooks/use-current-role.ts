import { authClient } from "@/lib/better-auth-client";

export function useCurrentRole(): string | null {
  const { data } = authClient.useSession();
  const user = data?.user as unknown as { role?: string } | undefined;
  return user?.role ?? null;
}
