import { auth as betterAuth } from "@/auth";
import { headers } from "next/headers";

export const currentUser = async () => {
    const h = await headers();
    const session = await betterAuth.api.getSession({
        headers: h,
    });

    return session?.user ?? null;
};

export const currentRole = async () => {
    const h = await headers();
    const session = await betterAuth.api.getSession({
        headers: h,
    });

    // Si tu User tiene `role` en DB, Better Auth lo expondrá aquí.
    const user = session?.user as unknown as Record<string, unknown> | undefined;
    const role = user?.role;
    return typeof role === "string" ? role : null;
};

export const currentProfile = async () => {
    const h = await headers();
    const session = await betterAuth.api.getSession({
        headers: h,
    });

    const user = session?.user as unknown as Record<string, unknown> | undefined;
    return (user?.Profile as unknown) ?? null;
};

/**
 * Compat layer: muchos archivos del proyecto estaban escritos como `const session = await auth()`.
 * Better Auth expone esto como `auth.api.getSession(...)`, así que lo envolvemos.
 */
export const auth = async () => {
  const h = await headers();
  return await betterAuth.api.getSession({
    headers: h,
  });
};

export { betterAuth };