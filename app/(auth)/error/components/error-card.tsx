import Image from "next/image";
import { CardWrapper } from "@/components/card-wrapper";

export const ErrorCard = () => {
    return (
        <CardWrapper 
            headerLabel="Bienvenido" 
            >       <div className="flex items-baseline flex-col">
                    <div className="relative w-full h-40 mb-[-100px] mt-[-80px]">
                        <Image 
                            src="/images/meme1.png" 
                            alt="Error" 
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h2 className="text-4xl mb-8 font-semibold text-black">Oops! Algo ha salido mal</h2>
                    </div>
                    <div className="flex flex-col gap-4 bg-red-100 p-4 rounded-xl text-red-800">
                    <p>Para confirmar tu identidad, debes iniciar sesión con la cuenta que usaste originalmente (Correo y contraseña, Google o Twitch).</p>
                    </div>
                    <div className="flex items-baseline">
                    <p className="mt-12 text-sm text-black">
                        Iniciar sesión con
                    </p>
                    <span className="ml-2 hover:underline cursor-pointer font-semibold text-sm text-black">
                        <a href="/register">Tu cuenta</a>
                    </span>
                    </div>
                    
        </CardWrapper>
    );
};