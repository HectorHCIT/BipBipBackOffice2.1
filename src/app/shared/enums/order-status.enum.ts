/**
 * OrderStatusType Enum
 *
 * Estados posibles de una orden en el sistema
 */
export enum OrderStatusType {
  Recibida = 1,
  Preparandose = 2,
  OrdenAceptada = 3,
  DeliveryEnRestaurante = 4,
  OrdenLista = 5,
  EnCamino = 6,
  Hellegado = 7,
  Entregada = 8,
  Cancelada = 9
}

/**
 * Mapeo de nombres legibles para los estados
 */
export const OrderStatusLabels: Record<OrderStatusType, string> = {
  [OrderStatusType.Recibida]: 'Recibida',
  [OrderStatusType.Preparandose]: 'Preparándose',
  [OrderStatusType.OrdenAceptada]: 'Orden Aceptada',
  [OrderStatusType.DeliveryEnRestaurante]: 'Delivery en Restaurante',
  [OrderStatusType.OrdenLista]: 'Orden Lista',
  [OrderStatusType.EnCamino]: 'En Camino',
  [OrderStatusType.Hellegado]: 'He llegado',
  [OrderStatusType.Entregada]: 'Entregada',
  [OrderStatusType.Cancelada]: 'Cancelada'
};
