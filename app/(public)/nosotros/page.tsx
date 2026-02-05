import Link from "next/link";

export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-bold text-black">
        Sobre el Comedor Universitario
      </h1>
      <p className="mt-2 font-medium text-amber-700">
        UNEXPO — Extensión Carora
      </p>

      <div className="mt-8 space-y-6 text-zinc-600">
        <p className="text-lg leading-relaxed">
          El <strong className="text-black">Comedor Universitario</strong> de la
          Universidad Nacional Experimental Politécnica (UNEXPO), extensión Carora, es un espacio
          al servicio de estudiantes, docentes y personal administrativo del campus.
        </p>
        <p className="leading-relaxed">
          Nuestro objetivo es ofrecer alimentación de calidad, accesible y práctica, para que la
          comunidad pueda realizar sus actividades académicas y laborales sin preocuparse por las
          comidas. Contamos con opciones de desayuno y comida, pensadas para una dieta equilibrada
          y un servicio ágil.
        </p>
        <p className="leading-relaxed">
          A través de este sistema de tickets en línea puedes comprar tus menús con anticipación,
          consultar tus reservas y canjear tu ticket directamente en el comedor, agilizando el
          proceso y evitando filas innecesarias.
        </p>
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link
          href="/"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-black hover:bg-zinc-50"
        >
          Volver al inicio
        </Link>
        <Link
          href="/login"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Acceder al sistema
        </Link>
      </div>
    </div>
  );
}
