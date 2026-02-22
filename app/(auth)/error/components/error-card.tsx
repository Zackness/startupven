import Image from "next/image";
import Link from "next/link";
import { CardWrapper } from "@/components/card-wrapper";

export const ErrorCard = () => {
  return (
    <CardWrapper>
      <div className="flex flex-col items-baseline">
        <div className="relative w-full h-40 mb-[-100px] mt-[-80px]">
          <Image
            src="/images/meme1.png"
            alt="Error"
            fill
            className="object-contain"
          />
        </div>
        <h2 className="text-2xl mb-6 font-semibold text-[var(--foreground)] sm:text-3xl">
          ¡Ups! Algo ha salido mal
        </h2>
      </div>
      <div className="flex flex-col gap-4 rounded-xl bg-destructive/10 p-4 text-destructive">
        <p>
          Para confirmar tu identidad, debes iniciar sesión con la cuenta que usaste originalmente (correo y contraseña o el método con el que te registraste).
        </p>
      </div>
      <div className="mt-8 flex items-baseline gap-2 text-sm text-[var(--muted-foreground)]">
        <span>Iniciar sesión con</span>
        <Link
          href="/login"
          className="font-semibold text-[var(--foreground)] underline underline-offset-2 hover:no-underline"
        >
          tu cuenta
        </Link>
      </div>
    </CardWrapper>
  );
};