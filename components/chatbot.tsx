"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Send, MessageCircle, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { matchFaq, getSuggestedQuestions, type ChatFaqContext } from "@/lib/chat-faq";
import { cn } from "@/lib/utils";

function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!message.parts?.length) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text" && "text" in p)
    .map((p) => p.text)
    .join("");
}

export interface ChatbotProps {
  /** Si true, muestra chips de preguntas frecuentes encima del input */
  showSuggestedQuestions?: boolean;
  /** Placeholder del input */
  placeholder?: string;
  /** Clases del contenedor (ej. para flotante o incrustado) */
  className?: string;
  /** Para escritorio: ancho máximo reducido */
  compact?: boolean;
  /** "public" = web (quiénes somos, servicios, contacto...); "client" = escritorio (soporte, facturas, tickets...) */
  context?: ChatFaqContext;
}

export function Chatbot({
  showSuggestedQuestions = true,
  placeholder = "Escribe tu pregunta...",
  className,
  compact = false,
  context = "public",
}: ChatbotProps) {
  const suggestedQuestions = getSuggestedQuestions(context);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    setMessages,
    sendMessage,
    status,
    error,
  } = useChat();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isLoading = status === "streaming" || status === "submitted";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");

    const faqAnswer = matchFaq(text, context);
    if (faqAnswer) {
      setMessages([
        ...messages,
        {
          id: crypto.randomUUID(),
          role: "user",
          parts: [{ type: "text", text }],
        },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          parts: [{ type: "text", text: faqAnswer, state: "done" }],
        },
      ]);
      return;
    }

    sendMessage({ text });
  }

  function handleSuggestedQuestion(question: string) {
    setInput(question);
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm",
        compact ? "max-w-md" : "max-w-2xl",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <MessageCircle className="h-5 w-5 text-[var(--primary)]" />
        <span className="font-medium text-[var(--foreground)]">Asistente</span>
      </div>

      <div className="flex max-h-[320px] min-h-[200px] flex-1 flex-col overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-[var(--muted-foreground)]">
            {context === "client"
              ? "Pregunta sobre soporte, facturas, tickets o tu cuenta. Si es una pregunta típica, verás una respuesta automática."
              : "Pregunta lo que quieras sobre servicios, precios o contacto. Si es una pregunta típica, verás una respuesta automática."}
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "mb-3 flex gap-2",
              m.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                m.role === "user"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border border-[var(--border)] bg-[var(--muted)]/50 text-[var(--foreground)]"
              )}
            >
              <div className="flex items-center gap-1.5 font-medium opacity-90">
                {m.role === "user" ? (
                  <User className="h-3.5 w-3.5" />
                ) : (
                  <Bot className="h-3.5 w-3.5" />
                )}
                <span className="text-xs">
                  {m.role === "user" ? "Tú" : "Startupven"}
                </span>
              </div>
              <div className="mt-1 whitespace-pre-wrap break-words [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:opacity-80">
                {m.role === "assistant" ? (
                  <ReactMarkdown
                    components={{
                      a: ({ href, children }) => {
                        if (!href) return <>{children}</>;
                        const isInternal = href.startsWith("/");
                        if (isInternal) {
                          return (
                            <Link href={href} className="text-[var(--primary)]">
                              {children}
                            </Link>
                          );
                        }
                        return (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)]">
                            {children}
                          </a>
                        );
                      },
                    }}
                  >
                    {getMessageText(m)}
                  </ReactMarkdown>
                ) : (
                  getMessageText(m)
                )}
              </div>
            </div>
          </div>
        ))}
        {error && (
          <p className="mb-2 text-sm text-red-600 dark:text-red-400">
            {error.message}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {showSuggestedQuestions && messages.length === 0 && (
        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] px-4 py-3">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSuggestedQuestion(q)}
              className="rounded-full border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t border-[var(--border)] p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={placeholder}
            rows={2}
            className="min-h-[44px] w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 shrink-0 self-end rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
