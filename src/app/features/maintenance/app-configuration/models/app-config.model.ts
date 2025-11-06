/**
 * General configurations for the app
 */
export interface GeneralConfigs {
  nearDistanceThreshold: number;       // Umbral de distancia cercana (metros)
  alertDisplayTime: number;            // Tiempo de visualización de alerta (segundos)
  canScanPaymentCard: boolean;         // Poder escanear tarjeta de pago
  useLuhnAlgorithm: boolean;           // Uso del algoritmo de Luhn
}

/**
 * PIN delivery method configuration
 */
export interface PinMethod {
  type: number;                        // 0=WhatsApp, 1=SMS, 2=Email
  title: string;                       // "WhatsApp", "SMS", "Email"
  showInScreen: boolean;               // Mostrar en pantalla
  showInResend: boolean;               // Permitir reenvío
  icon: string;                        // URL del icono
}

/**
 * Order-specific configurations
 */
export interface OrderConfigs {
  dynamicValueTitle: string;           // Título dinámico
  lateNightTitle: string;              // Título nocturno
  expressDeliveryToolTip: string;      // Tooltip express delivery
  kitchenNotesToolTip: string;         // Tooltip kitchen notes
  deliveryNotesToolTip: string;        // Tooltip delivery notes
  '3DSecureUrls': string[];            // URLs seguras 3DS
  splitPaymentAvailableInDelivery: boolean;  // Pago dividido en delivery
  splitPaymentAvailableInPickup: boolean;    // Pago dividido en pickup
}

/**
 * Complete app configuration
 */
export interface Config {
  generalConfigs: GeneralConfigs;
  pinMethods: PinMethod[];
  orderConfigs: OrderConfigs;
}

/**
 * Partial config for updates (only changed fields)
 */
export type ConfigUpdate = Partial<{
  generalConfigs: Partial<GeneralConfigs>;
  pinMethods: PinMethod[];
  orderConfigs: Partial<OrderConfigs>;
}>;
