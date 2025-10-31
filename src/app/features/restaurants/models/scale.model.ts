/**
 * Scale
 * Represents a delivery pricing scale based on distance range
 */
export interface Scale {
  id: number;
  customerCharge: number;  // Charge to customer (Lempiras)
  deliveryPayment: number; // Payment to delivery driver (Lempiras)
  active: boolean;         // Active/Inactive status
  minimum: string;         // Minimum distance range (stored as string, e.g., "0.00")
  maximum: string;         // Maximum distance range (stored as string, e.g., "5.00")
}

/**
 * Create Scale Request
 * Request payload for creating a new scale
 */
export interface CreateScaleRequest {
  customerCharge: number;
  deliveryPayment: number;
  active: boolean;
  minimum: string;  // API expects string
  maximum: string;  // API expects string
  restaurantId: number;
}

/**
 * Update Scale Request
 * Request payload for updating an existing scale
 */
export interface UpdateScaleRequest {
  id: number;
  customerCharge: number;
  deliveryPayment: number;
  active: boolean;
  minimum: string;  // API expects string
  maximum: string;  // API expects string
}
