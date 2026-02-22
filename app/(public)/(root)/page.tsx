import { getProyectosDestacados } from "@/data/proyectos";
import { HomeAnimated } from "./components/home-animated";

export default function HomePage() {
  const destacados = getProyectosDestacados(3);
  return (
    <div className="min-h-full">
      <HomeAnimated destacados={destacados} />
    </div>
  );
}
