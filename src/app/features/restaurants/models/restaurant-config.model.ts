/**
 * Schedule Config per Channel
 * Configuration for preparation time per channel
 */
export interface ScheduleConfig {
  storeId: number;
  channelId: number;
  time: number;        // Preparation time in minutes
  active: boolean;
}

/**
 * Driver Radius Config
 * Configuration for driver radius per channel
 */
export interface DriverRadiusConfig {
  channelId: number;
  storeId: number;
  radius: number;      // Radius in meters
  typeRadius: string;  // "R" for Restaurant, "C" for Client
}

/**
 * Payment Config
 * Configuration for payment methods per channel
 */
export interface PaymentConfig {
  channelId: number;
  storeId: number;
  paymentMethodId: number;
  maxOrders: number;
  cashAmount: number;
}

/**
 * Restaurant Configuration
 * Represents operational configurations for a restaurant
 */
export interface RestaurantConfig {
  // General Information
  restaurantCode?: string;        // Unique restaurant code
  neighborhood?: string;          // Barrio/Colonia (POS)
  preparingTime?: number;         // Preparation time in minutes
  active: boolean;                // Active status
  publish: boolean;               // Published status

  // Order Configuration
  cantMultiOrder: number;         // Multi-order quantity
  minNextOrder: number;           // Minimum next order
  maxProducts: number;            // Maximum products per order
  orderMaxAwaitTime: number;      // Maximum wait time in minutes

  // Payment Configuration
  allowBipPay: boolean;           // Allow BipPay
  codePosGCBPay?: string;         // POS GC BPay code

  // Delivery Configuration
  radioClientDelivery1: number;   // Client delivery radius 1 (km)
  radioClientDelivery2: number;   // Client delivery radius 2 (km)
  expressShippingValue: number;   // Express shipping value
  expressFeeDriver: number;       // Express fee for driver

  // Advanced Features
  enableSignalService: boolean;   // Enable signal service
  applyDynamicValue: boolean;     // Apply dynamic value
  dynamicValueCustomer: number;   // Dynamic value for customer
  dynamicValueDriver: number;     // Dynamic value for driver
  bPayDev: boolean;               // BPay dev mode

  // Sub-configurations (Arrays)
  scheduleConfigs: ScheduleConfig[];
  driverRadiusConfigs: DriverRadiusConfig[];
  paymentConfigs: PaymentConfig[];
}

/**
 * Create Restaurant Config Request
 * Request payload for creating restaurant configurations
 */
export interface CreateConfigRequest {
  // General Information
  restaurantCode?: string;
  neighborhood?: string;
  preparingTime?: number;
  active: boolean;
  publish: boolean;

  // Order Configuration
  cantMultiOrder: number;
  minNextOrder: number;
  maxProducts: number;
  orderMaxAwaitTime: number;

  // Payment Configuration
  allowBipPay: boolean;
  codePosGCBPay?: string;

  // Delivery Configuration
  radioClientDelivery1: number;
  radioClientDelivery2: number;
  expressShippingValue: number;
  expressFeeDriver: number;

  // Advanced Features
  enableSignalService: boolean;
  applyDynamicValue: boolean;
  dynamicValueCustomer: number;
  dynamicValueDriver: number;
  bPayDev: boolean;

  // Sub-configurations (Arrays)
  scheduleConfigs: ScheduleConfig[];
  driverRadiusConfigs: DriverRadiusConfig[];
  paymentConfigs: PaymentConfig[];
}

/**
 * Update Restaurant Config Request
 * Request payload for updating restaurant configurations
 */
export interface UpdateConfigRequest {
  // General Information
  restaurantCode?: string;
  neighborhood?: string;
  preparingTime?: number;
  active: boolean;
  publish: boolean;

  // Order Configuration
  cantMultiOrder: number;
  minNextOrder: number;
  maxProducts: number;
  orderMaxAwaitTime: number;

  // Payment Configuration
  allowBipPay: boolean;
  codePosGCBPay?: string;

  // Delivery Configuration
  radioClientDelivery1: number;
  radioClientDelivery2: number;
  expressShippingValue: number;
  expressFeeDriver: number;

  // Advanced Features
  enableSignalService: boolean;
  applyDynamicValue: boolean;
  dynamicValueCustomer: number;
  dynamicValueDriver: number;
  bPayDev: boolean;

  // Sub-configurations (Arrays)
  scheduleConfigs: ScheduleConfig[];
  driverRadiusConfigs: DriverRadiusConfig[];
  paymentConfigs: PaymentConfig[];
}
