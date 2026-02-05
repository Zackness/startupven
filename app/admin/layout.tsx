import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@/app/(auth)/components/user-button";
import { ADMIN_PATH, ESCRITORIO_PATH } from "@/routes";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN") {
    redirect(ESCRITORIO_PATH);
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <nav className="flex items-center gap-6">
            <Link
              href={ADMIN_PATH}
              className="text-sm font-medium text-zinc-600 hover:text-black"
            >
              Panel
            </Link>
            <Link
              href={`${ADMIN_PATH}/tickets`}
              className="text-sm font-medium text-zinc-600 hover:text-black"
            >
              Tickets
            </Link>
            <Link
              href={`${ADMIN_PATH}/tipos`}
              className="text-sm font-medium text-zinc-600 hover:text-black"
            >
              Tipos de ticket
            </Link>
            <Link
              href={`${ADMIN_PATH}/usuarios`}
              className="text-sm font-medium text-zinc-600 hover:text-black"
            >
              Usuarios
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600">
              {session.user.name} (Admin)
            </span>
            <UserButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
