/**
 * Datos de ejemplo para el escritorio STVN.
 * Sustituir por llamadas a API cuando exista backend de proyectos/dominios/tickets.
 */

import type { ProyectoFactura, Dominio, TicketModificacion } from "./escritorio-types";

export const MOCK_PROYECTOS: ProyectoFactura[] = [
  {
    id: "inv-2024-001",
    nombre: "Sitio web corporativo",
    referencia: "STVN-2024-001",
    estado: "pendiente",
    fechaEmision: "2024-01-15",
    fechaVencimiento: "2024-02-15",
    total: 1850,
    moneda: "USD",
    lineas: [
      { id: "1", concepto: "Desarrollo landing page", detalle: "Diseño y desarrollo", monto: 1200, cantidad: 1 },
      { id: "2", concepto: "Mensualidad servidor", detalle: "Hosting 12 meses", monto: 400, cantidad: 12 },
      { id: "3", concepto: "Dominio .com (1 año)", detalle: "Registro + renovación", monto: 250, cantidad: 1 },
    ],
  },
  {
    id: "inv-2024-002",
    nombre: "Ecommerce tienda online",
    referencia: "STVN-2024-002",
    estado: "pagado",
    fechaEmision: "2024-02-01",
    fechaVencimiento: "2024-03-01",
    total: 320,
    moneda: "USD",
    lineas: [
      { id: "1", concepto: "Mensualidad servidor", detalle: "Plan Pro", monto: 80, cantidad: 1 },
      { id: "2", concepto: "Mantenimiento mensual", detalle: "Actualizaciones y soporte", monto: 240, cantidad: 1 },
    ],
  },
  {
    id: "inv-2024-003",
    nombre: "Rediseño + migración",
    referencia: "STVN-2024-003",
    estado: "parcial",
    fechaEmision: "2024-03-10",
    fechaVencimiento: "2024-04-10",
    total: 2100,
    moneda: "USD",
    lineas: [
      { id: "1", concepto: "Rediseño UI/UX", monto: 900, cantidad: 1 },
      { id: "2", concepto: "Desarrollo y migración", monto: 800, cantidad: 1 },
      { id: "3", concepto: "Mensualidad servidor (6 meses)", monto: 400, cantidad: 6 },
    ],
  },
];

export const MOCK_DOMINIOS: Dominio[] = [
  { id: "d1", nombre: "miempresa.com", vencimiento: "2025-03-15", estado: "activo", precioRenovacion: 25 },
  { id: "d2", nombre: "tienda-miempresa.com", vencimiento: "2025-01-20", estado: "pendiente_pago", precioRenovacion: 25 },
];

export const MOCK_TICKETS: TicketModificacion[] = [
  { id: "t1", asunto: "Cambio de texto en página de contacto", proyectoRef: "STVN-2024-001", estado: "resuelto", fechaCreacion: "2024-02-01", ultimaActualizacion: "2024-02-03", mensajes: 4 },
  { id: "t2", asunto: "Añadir formulario de newsletter", proyectoRef: "STVN-2024-002", estado: "en_proceso", fechaCreacion: "2024-03-05", ultimaActualizacion: "2024-03-08", mensajes: 2 },
  { id: "t3", asunto: "Ajuste de colores en header", proyectoRef: "STVN-2024-001", estado: "abierto", fechaCreacion: "2024-03-12", ultimaActualizacion: "2024-03-12", mensajes: 1 },
];
