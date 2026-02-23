import { getProyectosDestacados } from "@/lib/actions/projects";
import { HomeAnimated } from "./components/home-animated";

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
