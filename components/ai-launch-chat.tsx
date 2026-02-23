"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = { role: "user" | "assistant"; content: string };

const PLACEHOLDER_REPLY =
  "Hemos recibido tu descripción. Próximamente podrás generar aquí la base estructural de tu arquitectura digital. Mientras tanto, usa el botón de contacto y te respondemos con los siguientes pasos.";

export function AiLaunchChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsLoading(true);

    // Placeholder: cuando exista API de IA, llamarla aquí y mostrar la respuesta real
    await new Promise((r) => setTimeout(r, 600));
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: PLACEHOLDER_REPLY },
    ]);
    setIsLoading(false);
  }

  return (
    <div className="w-full px-0 pt-6 sm:pt-8">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-[var(--border)] p-4">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Describe la arquitectura digital que quieres iniciar."
                rows={4}
                className="min-h-[120px] w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="h-12 w-12 shrink-0 self-end rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
