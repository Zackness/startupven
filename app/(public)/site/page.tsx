import { getProyectosDestacados } from "@/lib/actions/projects";
import { BRAND_TAGLINE } from "@/components/marca/brand";
import { HomeAnimated } from "./components/home-animated";

export const metadata = {
  title: "Inicio",
  description: BRAND_TAGLINE,
};

export default async function HomePage() {
  let destacados: Awaited<ReturnType<typeof getProyectosDestacados>> = [];
  try {
    destacados = await getProyectosDestacados(3);
  } catch {
    destacados = [];
  }
  return (
    <div className="min-h-full">
      <HomeAnimated destacados={destacados} />
    </div>
  );
}
