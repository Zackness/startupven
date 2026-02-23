"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Chatbot } from "@/components/chatbot";

export interface ChatbotFabProps {
  /** Versión compacta para escritorio (usa FAQs de cliente: soporte, facturas, tickets) */
  compact?: boolean;
}

export function ChatbotFab({ compact = false }: ChatbotFabProps) {
  const [open, setOpen] = useState(false);
  const context = compact ? "client" : "public";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg transition-transform hover:scale-105 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2"
        aria-label="Abrir chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col border-[var(--border)] p-0 sm:max-w-md"
        >
          <SheetTitle className="sr-only">Chat de asistente</SheetTitle>
          <div className="flex flex-1 flex-col overflow-hidden">
            <Chatbot
              showSuggestedQuestions={true}
              placeholder={compact ? "Soporte, facturas, tickets..." : "Escribe tu pregunta..."}
              compact={compact}
              context={context}
              className="h-full flex-1 rounded-none border-0 shadow-none"
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
