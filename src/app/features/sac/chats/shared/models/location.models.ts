/**
 * Modelos para datos de ubicación (países y ciudades)
 */

/**
 * País desde API Location/CountryList
 */
export interface Country {
  countryId: number;
  countryName: string;
  countryCode: string;        // "HN", "ATG", etc.
  isActive: boolean;
  countryPrefix: string;      // "+504"
  countryUrlFlag: string;     // URL de la bandera
  countryMask: string;        // "####-####"
}

/**
 * Ciudad desde API Location/CityList
 */
export interface City {
  cityId: number;
  codCountry: number;         // Foreign key a Country.countryId
  countryUrlFlag: string;
  countryName: string;
  cityName: string;           // "San Pedro Sula"
  cityCode: string;           // "SPS"
  isActive: boolean;
  couponMin: number;
  publish: boolean;
  codZone: number;
  zoneName: string;           // "Zona Norte"
  orderMin: number;
  freeShipping: boolean;
  faCpayment: boolean;
}

/**
 * Ubicación formateada para mostrar en UI
 * Formato: "HN/SPS" (countryCode/cityCode)
 */
export interface FormattedLocation {
  countryCode: string;        // "HN"
  cityCode: string;           // "SPS"
  displayText: string;        // "HN/SPS"
}
