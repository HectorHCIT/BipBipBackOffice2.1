/**
 * Representa una orden en la lista de seguimiento
 */
export interface TrackOrderList {
  /** Número de orden (ID principal) */
  numOrder: number;

  /** Detalles/resumen de los productos de la orden */
  orderDetails: string;

  /** Estado actual de la orden */
  orderStatus: string;

  /** Número de referencia POSGC */
  posgcId: number;

  /** Método de pago utilizado */
  paymentMethod: string;

  /** Monto total de la orden */
  orderAmount: number;

  /** Tiempo estimado de entrega */
  estimatedTime: string;

  /** Fecha de la orden (ISO string) */
  orderDate: string;

  /** Tiempo real de entrega */
  realTime: string;

  /** Estado general del pago */
  generalStatus: string;

  /** Método de recepción de la orden */
  reception: string;

  /** Método de envío/entrega */
  shipping: string;
}

/**
 * Metadata de paginación para las órdenes
 */
export interface OrderMetadata {
  /** Total de órdenes activas */
  totalActive: number;

  /** Total de órdenes inactivas */
  totalInactive: number;

  /** Número de página actual */
  page: number;

  /** Cantidad de elementos por página */
  perPage: number;

  /** Total de páginas */
  pageCount: number;

  /** Total de registros */
  totalCount: number;
}

/**
 * Respuesta del backend al listar órdenes
 */
export interface OrderListResponse {
  /** Lista de órdenes */
  records: TrackOrderList[];

  /** Metadata de paginación */
  metadata: OrderMetadata;
}

/**
 * Tipos de filtros de tiempo rápidos
 */
export enum TimeFilterType {
  LAST_HOUR = 1,
  LAST_24_HOURS = 2,
  LAST_WEEK = 3,
  LAST_MONTH = 4
}

/**
 * Parámetros para búsqueda simple de órdenes
 */
export interface OrderSearchParams {
  /** Número de página */
  pageNumber: number;

  /** Tamaño de página */
  pageSize: number;

  /** Opción de filtro de tiempo (1-4) */
  option?: TimeFilterType;

  /** Texto de búsqueda (orden, teléfono, cliente) */
  filter?: string;

  /** Mostrar órdenes no aprobadas */
  showNotApproved?: boolean;
}

/**
 * Parámetros para búsqueda con filtros avanzados
 */
export interface OrderAdvancedFilters {
  /** Número de página */
  pageNumber: number;

  /** Tamaño de página */
  pageSize: number;

  /** Fecha de inicio (ISO string YYYY-MM-DD) */
  StartDate?: string;

  /** Fecha de fin (ISO string YYYY-MM-DD) */
  EndDate?: string;

  /** IDs de países seleccionados */
  CountryIds: number[];

  /** IDs de ciudades seleccionadas */
  CityIds: number[];

  /** IDs de marcas seleccionadas */
  Brands?: number[];
}

/**
 * Filtros activos para mostrar como chips
 */
export interface ActiveFilter {
  /** Tipo de filtro */
  type: 'country' | 'city' | 'brand' | 'date' | 'time' | 'search';

  /** Label a mostrar en el chip */
  label: string;

  /** Valor del filtro (para poder eliminarlo) */
  value: any;
}

/**
 * Estado del sidebar de filtros
 */
export interface FilterSidebarState {
  /** IDs de países seleccionados */
  selectedCountries: number[];

  /** IDs de ciudades seleccionadas */
  selectedCities: number[];

  /** IDs de marcas seleccionadas */
  selectedBrands: number[];

  /** Fecha de inicio */
  startDate: Date | null;

  /** Fecha de fin */
  endDate: Date | null;
}

/**
 * Datos para gráfico de volumen
 */
export interface VolumeChartData {
  /** Nombre del gráfico */
  name: string;

  /** Serie de datos */
  series: ChartSeriesData[];
}

/**
 * Serie de datos para el gráfico
 */
export interface ChartSeriesData {
  /** Nombre del punto (ej: "1:00", "2:00") */
  name: string;

  /** Valor numérico */
  value: number;
}

/**
 * Datos de volumen desde la API
 */
export interface VolumeData {
  /** Tiempo/período */
  timeLapse: string;

  /** Cantidad de órdenes */
  orderQuantity: number;
}

/**
 * Motivo de cancelación
 */
export interface CancelReason {
  /** ID del motivo */
  id: number;

  /** Descripción del motivo */
  reason: string;
}

/**
 * Datos para cancelar una orden
 */
export interface CancelOrderRequest {
  /** ID de la orden */
  orderId: number;

  /** ID del motivo de cancelación */
  reason: number;

  /** Notas/comentarios adicionales */
  notes: string;

  /** Indica si el producto ya fue procesado */
  productProcessed: boolean;
}

/**
 * Datos para modificar tiempo de entrega
 */
export interface EditDeliveryTimeRequest {
  /** Número de orden */
  numOrder: number;

  /** Nuevo tiempo de entrega (ej: "30 min") */
  newTime: string;

  /** Motivo del cambio */
  reason: string;
}

// ============================================
// Order Detail Interfaces
// ============================================

/**
 * Detalle completo de una orden
 */
export interface TrackOrderDetails {
  // Order identification
  numOrder: number;
  posgc: number;
  cityId: number;
  orderDate: Date;
  channelId: number;
  brandId: number;

  // Status & flags
  isOrderSend: boolean;
  isSchedule: boolean;
  isExpress: boolean;
  generalStatus: string;
  orderStatusId: number;
  orderStatus: string;

  // Customer info
  idCustomer: number;
  customerName: string;
  customerPenalized: boolean;
  customerSecondaryPhone: string | null;
  dniCustomer: string;
  phoneCustomer: string;
  addressCustomer: string;
  referencePoints: string;

  // Driver info
  idDriver: number;
  driverId: number;
  nameDriver: string;
  driverName: string;
  driverPenalized: boolean;
  driverPhone: string | null;
  driverEmail: string | null;
  driverStatus: string | null;
  ratingDriver: number | null;
  driverVehicle: string | null;
  driverPlate: string | null;
  driverDocument: string | null;
  driverCity: string | null;

  // Order details
  comments: string;
  instructionsForDelivery: string;
  distanceOrder: number;

  // Payment
  idPaymentMethod: number;
  namePaymentMethod: string;
  paymentNotes: string;
  responseCard: string;
  cardUsed: string;
  authorizationCode: string;
  paidDetails: PaidDetail[];
  splitPayment: SplitItem[];

  // Company/Store
  idCompany: number;
  nameCompany: string;
  storeShortName: string;
  brandLogo: string;
  rutCompany: string;
  phoneCompany: string;
  addressCompany: string;

  // Timing
  estimatedTime: string;
  realTime: string;
  deliveryDate: Date;
  assignDate: Date;

  // Location coordinates
  deliveryLatitude: number;
  deliveryLongitude: number;
  receptionLatitude: number;
  receptionLongitude: number;
  takenLatitude: number | null;
  takenLongitude: number | null;
  finishLatitude: number | null;
  finishLongitude: number | null;

  // Related data
  rtn: Rtn;
  customer: Customer;
  status: OrderStatus[];
  ordersProductsDetails: OrdersProductsDetail[];
  cancelRequest: CancelRequest[];
  incidents: Incident[];
}

/**
 * Detalle de pago de la orden
 */
export interface PaidDetail {
  /** Nombre/concepto del pago */
  name: string;

  /** Monto */
  amount: number;
}

/**
 * Item de pago dividido
 */
export interface SplitItem {
  /** ID del split */
  idSplit: number;

  /** Nombre del cliente */
  customerName: string;

  /** Teléfono del cliente */
  customerPhone: string;

  /** Tipo: "Monto" o "Producto" */
  type: string;

  /** Monto a pagar */
  amount: number;

  /** IDs de productos asignados */
  productIds: string;

  /** Estado: true si está pagado */
  isPaid: boolean;

  /** Productos detallados (llenado después) */
  products?: ProductSplit[];
}

/**
 * Producto en split payment
 */
export interface ProductSplit {
  /** ID del producto */
  idProduct: number;

  /** Nombre del producto */
  productName: string;

  /** URL de la imagen */
  imageUrl: string;

  /** Precio */
  price: number;

  /** Cantidad */
  quantity: number;
}

/**
 * Información de RTN (empresa)
 */
export interface Rtn {
  /** Razón social */
  businessName: string;

  /** Número RTN */
  rtnNumber: string;
}

/**
 * Información del cliente
 */
export interface Customer {
  /** ID del cliente */
  idCustomer: number;

  /** Nombre completo */
  customerName: string;

  /** Teléfono principal */
  phoneCustomer: string;

  /** Teléfono secundario */
  customerSecondaryPhone: string | null;

  /** Dirección */
  addressCustomer: string;

  /** Puntos de referencia */
  referencePoints: string;
}

/**
 * Estado/historial de la orden
 */
export interface OrderStatus {
  /** Nombre del estado */
  name: string;

  /** Hora del estado (formato string HH:mm) */
  time: string;

  /** Nombre del driver (si aplica) */
  driver: string | null;
}

/**
 * Detalle de producto en la orden
 */
export interface OrdersProductsDetail {
  /** ID del producto */
  idProduct: number;

  /** Nombre del producto */
  productName: string;

  /** Cantidad */
  quantity: number;

  /** Precio unitario */
  unitPrice: number;

  /** Subtotal */
  subtotal: number;

  /** Porcentaje de ISV */
  taxPercentage: number;

  /** Monto de ISV */
  taxAmount: number;

  /** Total */
  total: number;

  /** Modificadores del producto */
  modifiers: string;

  /** Comentarios del producto */
  comments: string;
}

/**
 * Solicitud de cancelación
 */
export interface CancelRequest {
  /** ID de la solicitud */
  idRequest: number;

  /** Motivo */
  reason: string;

  /** Comentarios */
  comments: string;

  /** Fecha de solicitud */
  requestDate: Date;

  /** Estado de la solicitud */
  status: string;

  /** Usuario que solicitó */
  requestedBy: string;
}

/**
 * Incidencia de la orden
 */
export interface Incident {
  /** ID de la incidencia */
  idIncident: number;

  /** Tipo de incidencia */
  incidentType: string;

  /** Descripción */
  description: string;

  /** Fecha de creación */
  createdAt: Date;

  /** Usuario que creó */
  createdBy: string;

  /** Estado */
  status: string;
}

// ============================================
// Driver Management Interfaces
// ============================================

/**
 * Driver en lista
 */
export interface DriverList {
  /** ID del driver */
  idDriver: number;

  /** Código del driver (BIP-XXXXX) */
  codeDriver: string;

  /** Nombre completo del driver */
  fullNameDriver: string;
}

/**
 * Detalle completo del driver
 */
export interface DriverDetails {
  /** ID del driver */
  idDriver: number;

  /** Nombre completo */
  driverName: string;

  /** Teléfono */
  phone: string;

  /** Email */
  email: string;

  /** DNI */
  dni: string;

  /** Ciudad */
  cityName: string;

  /** Estado */
  status: string;

  /** Calificación promedio */
  rating: number;

  /** Total de órdenes completadas */
  totalOrders: number;

  /** Foto de perfil */
  profilePicture: string;

  /** Fecha de registro */
  registeredDate: Date;

  /** Vehículo */
  vehicle: string;

  /** Placa */
  licensePlate: string;
}

/**
 * Estado actual del driver
 */
export interface DriverStatus {
  /** ID del driver */
  idDriver: number;

  /** Estado: "Disponible", "En ruta", "Ocupado" */
  status: string;

  /** ID del estado */
  statusId: number;

  /** Orden actual (si tiene) */
  currentOrderId: number | null;

  /** Última ubicación - latitud */
  latitude: number;

  /** Última ubicación - longitud */
  longitude: number;

  /** Última actualización */
  lastUpdate: Date;
}

/**
 * Datos para asignar/reasignar/liberar driver
 */
export interface ReAssignDriver {
  /** ID del driver */
  driverId: number;

  /** ID de la orden */
  orderId: number;

  /** Comentarios (opcional) */
  comments?: string;
}

/**
 * Datos para penalizar driver
 */
export interface MotivePenalized {
  /** Fecha de inicio de la penalización */
  startDate: Date;

  /** Fecha de fin de la penalización */
  endDate: Date;

  /** ID del driver */
  driverId: number;

  /** Descripción de la penalización */
  descripcion: string;

  /** ID del motivo de penalización */
  reasonId: number;
}

// ============================================
// Action Request Interfaces
// ============================================

/**
 * Datos para crear incidencia
 */
export interface CreateIncidentRequest {
  /** ID de la orden */
  orderId: number;

  /** Motivo de la incidencia (como string) */
  reason: string;

  /** Comentario/Descripción */
  comment: string;

  /** Solución propuesta */
  solution: string;

  /** Persona que atiende */
  attendant: string;
}

/**
 * Datos para cambiar restaurante
 */
export interface ChangeStoreRequest {
  /** ID de la orden */
  orderId: number;

  /** ID del nuevo restaurante */
  newStoreId: number;

  /** Comentarios del cambio */
  comments: string;
}
