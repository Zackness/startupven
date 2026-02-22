import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="home-grid-fade" aria-hidden />
      <Header />
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
