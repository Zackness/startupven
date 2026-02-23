/**
 * Tipos para el escritorio STVN: proyectos (facturación), dominios, tickets de modificaciones.
 * Los datos pueden venir después de una API; aquí se define la forma.
 */

export type EstadoPago = "pendiente" | "pagado" | "vencido" | "parcial";

/** Línea de factura: concepto + monto (desarrollo, mensualidad, dominio, etc.) */
export interface LineaFactura {
  id: string;
  concepto: string;
  detalle?: string;
  monto: number;
  cantidad?: number;
}

/** Proyecto/Factura: agrupa líneas (proyecto web, mensualidad servidor, etc.) */
export interface ProyectoFactura {
  id: string;
  nombre: string;
  referencia: string;
  estado: EstadoPago;
  fechaEmision: string;
  fechaVencimiento?: string;
  lineas: LineaFactura[];
  total: number;
  moneda?: string;
}

export interface Dominio {
  id: string;
  nombre: string;
  vencimiento?: string;
  estado: "activo" | "pendiente_pago" | "vencido";
  precioRenovacion?: number;
}

export type EstadoTicket = "abierto" | "en_proceso" | "resuelto" | "cerrado";

export interface TicketModificacion {
  id: string;
  asunto: string;
  proyectoRef?: string;
  estado: EstadoTicket;
  fechaCreacion: string;
  ultimaActualizacion: string;
  mensajes?: number;
}
