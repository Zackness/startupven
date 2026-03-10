"use client";

import * as React from "react";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function SidebarShellSkeleton({ maxWidthClass }: { maxWidthClass: string }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]" suppressHydrationWarning>
      <div className="flex min-h-screen" suppressHydrationWarning>
        <div className="flex min-w-0 flex-1 flex-col" suppressHydrationWarning>
          <header className="sticky top-0 z-10 border-b border-[var(--border)] h-14" suppressHydrationWarning />
          <main className={cn("mx-auto w-full px-6 py-10 sm:px-8 sm:py-12", maxWidthClass)} suppressHydrationWarning>
            <div className="animate-pulse rounded-lg bg-[var(--muted)] h-48" suppressHydrationWarning />
          </main>
        </div>
      </div>
    </div>
  );
}

export function SidebarShell(props: {
  storageKey: string;
  title: string;
  subtitle?: string;
  maxWidthClass: string;
  headerRight: React.ReactNode;
  nav: React.ReactNode;
  children: React.ReactNode;
}) {
  const [desktopOpen, setDesktopOpen] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      const v = window.localStorage.getItem(props.storageKey);
      if (v === "0") setDesktopOpen(false);
      if (v === "1") setDesktopOpen(true);
    } catch {
      // ignore
    }
  }, [mounted, props.storageKey]);

  function toggleDesktop() {
    setDesktopOpen((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(props.storageKey, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  if (!mounted) {
    return <SidebarShellSkeleton maxWidthClass={props.maxWidthClass} />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]" suppressHydrationWarning>
      <div className="flex min-h-screen" suppressHydrationWarning>
        <aside
          className={cn(
            "hidden shrink-0 transition-[width] duration-200 md:block",
            desktopOpen ? "w-64 border-r border-[var(--border)]" : "w-0 border-r-0"
          )}
          aria-hidden={!desktopOpen}
          suppressHydrationWarning
        >
          <div
            className={cn(
              "h-full overflow-hidden",
              desktopOpen ? "p-4 opacity-100" : "p-0 opacity-0 pointer-events-none"
            )}
            suppressHydrationWarning
          >
            <div className="mb-4" suppressHydrationWarning>
              <p className="text-sm font-semibold text-[var(--foreground)]">{props.title}</p>
              {props.subtitle && <p className="text-xs text-[var(--muted-foreground)]">{props.subtitle}</p>}
            </div>
            {props.nav}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col" suppressHydrationWarning>
          <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80" suppressHydrationWarning>
            <div className={cn("mx-auto flex h-14 items-center justify-between gap-3 px-6 sm:px-8", props.maxWidthClass)} suppressHydrationWarning>
              <div className="flex items-center gap-2" suppressHydrationWarning>
                <div className="md:hidden" suppressHydrationWarning>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Abrir menú">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-4">
                      <SheetHeader className="pr-10">
                        <SheetTitle>{props.title}</SheetTitle>
                      </SheetHeader>
                      <div className="mt-4">{props.nav}</div>
                    </SheetContent>
                  </Sheet>
                </div>
                <div className="hidden md:block" suppressHydrationWarning>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={desktopOpen ? "Ocultar barra lateral" : "Mostrar barra lateral"}
                    onClick={toggleDesktop}
                  >
                    {desktopOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4" suppressHydrationWarning>{props.headerRight}</div>
            </div>
          </header>
          <main className={cn("mx-auto w-full px-6 py-10 sm:px-8 sm:py-12", props.maxWidthClass)} suppressHydrationWarning>{props.children}</main>
        </div>
      </div>
    </div>
  );
}

