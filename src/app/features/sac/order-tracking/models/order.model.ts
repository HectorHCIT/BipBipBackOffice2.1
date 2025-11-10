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
  incidents: OrderIncidentManual[];
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
  idDriver?: number;

  /** ID del driver (alternativa) */
  driverId?: number;

  /** Código del driver */
  driverCode?: string;

  /** Nombre completo del driver */
  fullname?: string;

  /** ID de la ciudad */
  cityId?: number;

  /** Disponible para asignación */
  isAvailableForAssignment?: boolean;

  /** Está trabajando actualmente */
  isCurrentlyWorking?: boolean | null;

  /** Estado activo/inactivo */
  status?: boolean | string;

  /** ID del estado */
  statusId?: number;

  /** Tiene penalización activa */
  hasActivePenalty?: boolean;

  /** Orden actual (si tiene) */
  currentOrderId?: number | null;

  /** Última ubicación - latitud */
  latitude?: number;

  /** Última ubicación - longitud */
  longitude?: number;

  /** Última actualización */
  lastUpdate?: Date;
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

/**
 * Datos para penalizar cliente
 */
export interface CustomerPenalty {
  /** ID del cliente */
  customerId: number;

  /** ID del motivo de penalización */
  penaltyReasonId: number;

  /** Comentarios de la penalización */
  comments: string;

  /** Estado de la penalización (siempre true al crear) */
  status: boolean;
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

// ============================================
// Tabs Adicionales - Interfaces
// ============================================

/**
 * Solicitud de cancelación de orden
 */
export interface CancelRequest {
  /** Código de la solicitud */
  codCancelRequest: number;

  /** ID de la orden */
  orderId: number;

  /** ID de orden en POSGC */
  posgcOrderId: number;

  /** Fecha de la solicitud */
  dateRequest: string;

  /** Usuario que solicitó */
  userRequest: string;

  /** Comentario de la solicitud */
  comment: string;

  /** Tienda */
  store: string;

  /** Si el producto fue preparado */
  productWasPrepared: boolean;

  /** Canal de venta */
  channel: string;

  /** Usuario que aprobó/rechazó */
  userAproved: string;

  /** Estado: 'Pendiente', 'Aprobada', 'Rechazada' */
  status: string;
}

/**
 * Datos para aprobar solicitud de cancelación
 */
export interface ApproveRequest {
  /** Código de la solicitud */
  codOrderCancelRequest: number;

  /** Comentario */
  comment: string;

  /** Código de razón de cancelación */
  codCancelReason: number;

  /** Si el producto fue procesado */
  productProcessed: boolean;
}

/**
 * Datos para denegar solicitud de cancelación
 */
export interface DenyRequest {
  /** Código de la solicitud */
  codOrderCancelRequest: number;

  /** Comentario */
  comment: string;
}

/**
 * Razón de cancelación del catálogo
 */
export interface ReasonCancelList {
  /** ID de la razón */
  id: number;

  /** Descripción de la razón */
  reason: string;
}

/**
 * Incidencia/Ocurrencia registrada manualmente
 */
export interface OrderIncidentManual {
  /** ID de la incidencia */
  id: number;

  /** Fecha de creación */
  createdAt: string;

  /** Usuario que creó */
  createdBy: string;

  /** Tipo de incidencia */
  type: string;

  /** Razón/motivo */
  reason: string;

  /** Comentarios */
  comments: string;

  /** Soluciones aplicadas */
  solution: IncidentSolution[];
}

/**
 * Solución aplicada a una incidencia
 */
export interface IncidentSolution {
  /** Descripción de la solución */
  solution: string;

  /** Fecha de la solución */
  createdAt: string;

  /** Usuario que solucionó */
  createdBy: string;

  /** Encargado de la solución */
  attendant: string;
}

/**
 * Incidencia del sistema (auditoría automática)
 */
export interface OrderIncident {
  /** ID de la orden */
  orderId: number;

  /** Fecha del incidente */
  createDateIncident: string;

  /** Usuario que generó el incidente */
  userCreateIncident: string;

  /** Tipo: 'A', 'D', 'E', 'CO' */
  incidentType: string;

  /** ID del driver anterior (solo para reasignaciones) */
  previousDriverId?: number;
}

/**
 * Estado completo de un driver para incidencias
 */
export interface DriverIncidentInfo {
  /** ID del driver */
  driverId: number;

  /** Código del driver */
  driverCode: string;

  /** Nombre completo */
  fullname: string;

  /** ID de ciudad */
  cityId: number;

  /** Si está disponible para asignación */
  isAvailableForAssignment: boolean;

  /** Si está trabajando actualmente */
  isCurrentlyWorking: boolean | null;

  /** Estado activo/inactivo */
  isActive: boolean;

  /** Si tiene penalización activa */
  hasActivePenalty: boolean;
}

/**
 * Enum de tipos de incidentes del sistema
 */
export enum IncidentType {
  ASSIGNMENT = 'A',      // Asignación inicial
  REASSIGNMENT = 'D',    // Reasignación (Derivación)
  CANCELLATION = 'E',    // Cancelación (Eliminación)
  COMPLETION = 'CO'      // Completación
}

/**
 * Obtener nombre legible del tipo de incidente
 */
export const getIncidentTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    'A': 'Asignación',
    'D': 'Reasignación',
    'E': 'Cancelación',
    'CO': 'Completación'
  };
  return typeMap[type] || type;
};

/**
 * Obtener clases CSS para badge según tipo de incidente
 */
export const getIncidentTypeSeverity = (type: string): 'info' | 'warn' | 'danger' | 'success' | 'secondary' => {
  const severityMap: Record<string, 'info' | 'warn' | 'danger' | 'success' | 'secondary'> = {
    'A': 'info',      // Asignación - Azul
    'D': 'warn',      // Reasignación - Naranja (warn en vez de warning)
    'E': 'danger',    // Cancelación - Rojo
    'CO': 'success'   // Completación - Verde
  };
  return severityMap[type] || 'secondary';
};
