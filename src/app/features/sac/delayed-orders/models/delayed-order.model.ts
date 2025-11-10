/**
 * Metadata para paginación
 */
export interface Metadata {
  page: number;
  perPage: number;
  pageCount: number;
  totalCount: number;
}

/**
 * Orden con demora
 */
export interface DelayedOrder {
  ordersId: number;
  poscgcOrderId: number;
  orderStatus: boolean;
  driverId: number | null;
  driverName: string;
  customerName: string;
  store: string;
  channelId: number;
  channelName: string;
  cityId: number;
  cityName: string;
  countryId: number;
  countryName: string;
  dateDelivery: string;
  delayedOrderTime: string;
}

/**
 * Response de lista de órdenes con demora
 */
export interface DelayedOrdersResponse {
  metadata: Metadata;
  records: DelayedOrder[];
}

/**
 * Driver disponible para asignación
 */
export interface Driver {
  driverId: number;
  driverCode: string;
  driverFullName: string;
  idCountry: number;
  countryName: string;
  idCity: number;
  cityName: string;
  driverStatusId: number;
  driverStatusName: string;
}

/**
 * Payload para asignar driver
 */
export interface AssignDriverPayload {
  orderId: number;
  driverId: number;
}

/**
 * Filtro activo en la UI
 */
export interface ActiveFilter {
  type: 'date' | 'country' | 'city';
  label: string;
  value: any;
}
