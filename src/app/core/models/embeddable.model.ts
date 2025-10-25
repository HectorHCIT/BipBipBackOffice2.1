/**
 * Token de autenticación para dashboards de Embeddable.com
 */
export interface TokenDash {
  token: string;
  expiresAt: number;
}

/**
 * Enum que mapea los nombres exactos de embeddables BipBip desde la API de Embeddable.com
 * Estos nombres deben coincidir exactamente con los devueltos por la API
 */
export enum EmbeddableNames {
  // Dashboards principales
  CART_DASH = 'BipBip.CartDash',
  DRIVERS = 'BipBip.Drivers',
  ORDERS_INCIDENCIAS = 'BipBip.Ordenes.Incidencias',
  LOYALTY_GLOBAL = 'BipBip.Loyalty.Global',
  KPI_APP = 'BipBip.KPIApp',
  PROPINAS = 'BipBip.Propinas',
  CANCELACIONES = 'BipBip.Cancelaciones',
  SOLICITUDES_DRIVER = 'BipBip.SolicitudesParaSerDriver',
  CONVERTION_PROMOTION = 'BipBip.ConvertionsPromotion',
  INSTALL_UPDATES = 'BipBip.InstallUpdates',
  TOP_DEVICES = 'BipBip.TopDevices',
  ORDENES = 'BipBip.Ordenes',
  HOME = 'BipBip.Home',
  ORDENES_FRECUENCIA = 'BipBip.Ordenes.FrecuenciaC',
  ORDENES_TIEMPO_ENTREGAS = 'BipBip.Ordenes.TiempoEntregas',
  DRIVERS_TOPS = 'BipBip.Drivers.Tops',
  CUSTOMER_GENERAL = 'BipBip.Customer General',
  CUSTOMERS = 'BipBip.Customers',
  PROMOTIONS = 'BipBip.Promotions',
  LOYALTY = 'BipBip.Loyalty',
}

/**
 * Mapeo de claves de token a nombres de embeddables
 * Utilizado para mantener compatibilidad con el sistema actual
 */
export const TOKEN_KEY_TO_EMBEDDABLE_NAME: Record<string, EmbeddableNames> = {
  'Dash': EmbeddableNames.HOME,
  'DashCustomer': EmbeddableNames.CUSTOMERS,
  'DashCancelations': EmbeddableNames.CANCELACIONES,
  'DashOrders': EmbeddableNames.ORDENES,
  'DashDelivery': EmbeddableNames.DRIVERS,
  'DasKpiBipBip': EmbeddableNames.KPI_APP,
  'DasPromotions': EmbeddableNames.PROMOTIONS,
  'DasLoyalty': EmbeddableNames.LOYALTY,
  'DasLoyaltyGlobal': EmbeddableNames.LOYALTY_GLOBAL,
  'DasPropinas': EmbeddableNames.PROPINAS,
  'DasCustomerGeneral': EmbeddableNames.CUSTOMER_GENERAL,
  'DasConvertionPromo': EmbeddableNames.CONVERTION_PROMOTION,
  'DasCarrito': EmbeddableNames.CART_DASH,
  'DasInstallAndUpdates': EmbeddableNames.INSTALL_UPDATES,
  'DasTopDevices': EmbeddableNames.TOP_DEVICES,
  'DasDriverSolicitud': EmbeddableNames.SOLICITUDES_DRIVER,
  'DasDriversTops': EmbeddableNames.DRIVERS_TOPS,
  'DasFrecuencia': EmbeddableNames.ORDENES_FRECUENCIA,
  'DasIncidencias': EmbeddableNames.ORDERS_INCIDENCIAS,
  'DasTiempoEntrega': EmbeddableNames.ORDENES_TIEMPO_ENTREGAS,
};

/**
 * Información de un embeddable desde la API de Embeddable.com
 */
export interface EmbeddableInfo {
  id: string;
  name: string;
  lastPublishedAt: {
    default?: string;
    production?: string;
    development?: string;
    staging?: string;
  };
}

/**
 * Respuesta de la API de Embeddable.com
 */
export interface EmbeddableResponse {
  embeddables: EmbeddableInfo[];
}
