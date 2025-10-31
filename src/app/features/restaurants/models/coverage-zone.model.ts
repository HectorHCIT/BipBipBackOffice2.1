/**
 * Coverage Zone
 * Represents a delivery coverage zone (circular area)
 */
export interface CoverageZone {
  zoneId: number;
  zoneName: string;
  zoneRadius: number;       // Radius in meters
  zoneLat: number;          // Center latitude
  zoneLon: number;          // Center longitude
  zoneMinAmount: number;    // Minimum order amount
  isRestaurant: boolean;    // true = restaurant zone, false = driver zone
}

/**
 * Restaurant Delivery Zone (from API)
 */
export interface RESTDeliveriesZone {
  delZoneId: number;
  delZoneName: string;
  delMinAmount: number;
  delZoneRad: number;       // Radius in meters
  delZoneLat: number;       // Latitude
  delZoneLon: number;       // Longitude
}

/**
 * Driver Delivery Zone (from API)
 */
export interface DriverRESTDelZone {
  driverId: number;
  driverZoneName: string;
  driverMinAmount: number;
  driverRadius: number;     // Radius in meters
  driverLatitude: number;
  driverLongitude: number;
}

/**
 * Create Coverage Zone Request
 */
export interface CreateCoverageZoneRequest {
  isRestaurant: boolean;
  zoneName: string;
  minAmount: number;
  zoneRad: number;          // Radius in meters
  zoneLat: number;
  zoneLon: number;
}

/**
 * Update Coverage Zone Request
 */
export interface UpdateCoverageZoneRequest {
  isRestaurant: boolean;
  zoneName: string;
  minAmount: number;
  zoneRad: number;          // Radius in meters
  zoneLat: number;
  zoneLon: number;
}
