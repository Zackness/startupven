import { authClient } from "@/lib/better-auth-client";

export const useCurrentUser = () => {
  const { data, isPending } = authClient.useSession();

  if (isPending) return null;
  return data?.user ?? null;
};