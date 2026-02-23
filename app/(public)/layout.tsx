import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ChatbotFab } from "@/components/chatbot-fab";

export default function PublicRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="home-grid-fade" aria-hidden />
      <Header />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
      <ChatbotFab />
    </div>
  );
}