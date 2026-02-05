import Link from "next/link";
import { UtensilsCrossed, Ticket, Clock } from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-amber-50/80 to-white">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:py-28">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
              Comedor Universitario
            </h1>
            <p className="mt-3 text-xl text-amber-800 sm:text-2xl">
              UNEXPO — Extensión Carora
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600">
              Alimentación sana y accesible para la comunidad universitaria.
              Compra tus tickets de forma sencilla y canjea tu menú en el comedor.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-zinc-800"
              >
                <Ticket className="h-5 w-5" />
                Acceder al sistema
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-zinc-300 bg-white px-6 py-3 text-base font-semibold text-black hover:bg-zinc-50"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Qué ofrecemos */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <h2 className="text-center text-2xl font-bold text-black sm:text-3xl">
          ¿Qué ofrecemos?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-zinc-600">
          El comedor de la UNEXPO Carora pone a tu disposición un servicio de
          alimentación práctico y económico para estudiantes, docentes y
          trabajadores.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <UtensilsCrossed className="h-6 w-6 text-amber-700" />
            </div>
            <h3 className="mt-4 font-semibold text-black">
              Menús variados
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              Desayunos y comidas preparados para cubrir tu día de estudio o
              trabajo en el campus.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">
              <Ticket className="h-6 w-6 text-black" />
            </div>
            <h3 className="mt-4 font-semibold text-black">
              Tickets en línea
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              Compra y gestiona tus tickets desde aquí. Sin filas: reserva tu
              menú y canjea en el comedor.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <Clock className="h-6 w-6 text-green-700" />
            </div>
            <h3 className="mt-4 font-semibold text-black">
              Horarios al servicio de la comunidad
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              Un espacio pensado para que puedas comer en el campus de forma
              cómoda y segura.
            </p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-zinc-200 bg-zinc-100">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h2 className="text-xl font-bold text-black sm:text-2xl">
            ¿Ya tienes cuenta?
          </h2>
          <p className="mt-2 text-zinc-600">
            Inicia sesión para comprar tickets y ver tus reservas.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-zinc-800"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>
    </>
  );
}
