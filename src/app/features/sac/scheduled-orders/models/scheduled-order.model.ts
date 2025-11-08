/**
 * Representa una orden programada para entrega futura
 */
export interface ScheduledOrder {
  /** ID de la orden */
  orderId: number;

  /** Nombre de la marca */
  brand: string;

  /** Nombre de la tienda/unidad */
  store: string;

  /** URL del logo de la marca */
  brandLogo: string;

  /** Método de pago utilizado */
  paymentMethod: string;

  /** Nombre del cliente */
  customer: string;

  /** Fecha programada para el envío (ISO string) */
  datePush: string;

  /** Monto total de la orden */
  total: number;

  /** Comentarios o notas adicionales */
  comments: string;
}
