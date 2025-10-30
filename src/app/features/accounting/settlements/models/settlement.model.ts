/**
 * Settlement Module Models
 * Interfaces para el módulo de liquidaciones
 */

/**
 * Información de RTN de la empresa
 */
export interface Rtn {
  companyName: string;
  rut: string;
}

/**
 * Información del cliente
 */
export interface Customer {
  name: string;
  phone: string;
  address: string;
}

/**
 * Estado de la orden con historial
 */
export interface OrderStatus {
  name: string;
  time: string;
  driver: string;
}

/**
 * Detalle de producto en la orden
 */
export interface OrderProduct {
  idConcept: number;
  idProduct: number;
  nameConcept: string;
  unitPrice: number;
  quantity: number;
  subTotal: number;
  isv: number;
  total: number;
}

/**
 * Detalle de pago
 */
export interface PaymentDetail {
  name: string;
  amount: number;
}

/**
 * Orden completa con todos sus detalles
 */
export interface Order {
  // Identificación de orden
  numOrder: number;
  cityId: number;
  orderDate: string;
  generalStatus: string;
  orderStatusId: number;
  orderStatus: string;

  // Información del cliente
  idCustomer: number;
  customerName: string;
  dniCustomer: string;
  phoneCustomer: string;
  addressCustomer: string;
  customerPenalized: boolean;

  // Información del conductor
  idDriver: number;
  nameDriver: string;
  driverPenalized: boolean;

  // Información de la empresa/restaurante
  idCompany: number;
  nameCompany: string;
  rutCompany: string;
  phoneCompany: string;
  addressCompany: string;

  // Objetos anidados
  rtn: Rtn;
  customer: Customer;
  status: OrderStatus[];
  ordersProductsDetails: OrderProduct[];
  paidDetails: PaymentDetail[];

  // Ubicación y tiempo
  deliveryLatitude: number;
  deliveryLongitude: number;
  receptionLatitude: number;
  receptionLongitude: number;
  estimatedTime: string;
  realTime: string;
  deliveryDate: string;
  assignDate: string;

  // Método de pago
  idPaymentMethod: number;
  namePaymentMethod: string;
}

/**
 * Marca/Brand para selector
 */
export interface BrandsList {
  idBrand: number;
  nameBrand: string;
  logoBrand: string;
  sortOrderBrand: number;
}

/**
 * Sede/HQ/Unidad para selector
 */
export interface HQList {
  restId: number;
  shortName: string;
}

/**
 * Ciudad con información completa
 */
export interface CityList {
  cityId: number;
  codCountry: number;
  countryUrlFlag: string;
  countryName: string;
  cityName: string;
  cityCode: string;
  isActive: boolean;
  couponMin: number;
  publish: boolean;
  codZone: number;
  zoneName: string;
  orderMin: number;
  freeShipping: boolean;
  faCpayment: boolean;
}

/**
 * Request para crear una liquidación
 */
export interface SettlementRequest {
  orderId: number;
  brandId: number;
  restaurantId: number;
  cityId: number;
  driverId: number;
  settlementDate: string; // ISO format
  comment?: string;
}

/**
 * Response de liquidación exitosa
 */
export interface SettlementResponse {
  success: boolean;
  message: string;
  settlementId?: number;
}
