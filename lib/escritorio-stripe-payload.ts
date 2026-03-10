/** Payload para recuperar al volver de Stripe tras crear proyecto desde escritorio. */
export type EscritorioCrearProyectoPayload = {
  titulo: string;
  descripcion?: string;
  categorias?: string[];
  packageIds: string[];
  totalAmount: number;
};
