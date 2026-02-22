/**
 * Proyectos realizados para la web y la sección de inicio.
 * Añade o edita proyectos; opcionalmente pon la URL de una imagen en `imagen`.
 */

export interface Proyecto {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  año: string;
  /** URL de la imagen del proyecto (ej. /images/proyectos/nombre.jpg). Si no hay, se usa un placeholder visual. */
  imagen?: string;
}

export const proyectos: Proyecto[] = [
  {
    id: "1",
    titulo: "Sistema corporativo",
    descripcion: "Sitio institucional con blog integrado y formularios. Estructura modular y mantenible.",
    tipo: "Página web",
    año: "2024",
  },
  {
    id: "2",
    titulo: "Portal de cliente",
    descripcion: "Plataforma centralizada para gestión de proyectos, facturación y soporte. Un único punto de acceso.",
    tipo: "Plataforma",
    año: "2024",
  },
  {
    id: "3",
    titulo: "Tienda y landing integradas",
    descripcion: "Landing conectada a tienda online con pasarela de pago y gestión de pedidos. Sistema operativo unificado.",
    tipo: "E-commerce",
    año: "2024",
  },
];

/** Proyectos destacados para la sección de inicio (por defecto los 3 primeros). */
export function getProyectosDestacados(limit = 3): Proyecto[] {
  return proyectos.slice(0, limit);
}
