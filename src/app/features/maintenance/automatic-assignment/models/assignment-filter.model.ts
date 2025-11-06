/**
 * Interfaz para filtros de fecha
 */
export interface DateFilter {
  inicioFecha: string | null;
  finalFecha: string | null;
}

/**
 * Interfaz para país con flag de selección
 */
export interface Country {
  countryId: number;
  countryName: string;
  countryCode: string;
  isActive: boolean;
  countryPrefix: string;
  countryUrlFlag: string;
  countryMask: string;
  checked?: boolean;
}

/**
 * Interfaz para ciudad con flag de selección
 */
export interface City {
  cityId: number;
  codCountry: number;
  countryUrlFlag: string;
  countryName: string;
  cityName: string;
  cityCode: string;
  isActive: boolean;
  checked?: boolean;
}

/**
 * Parámetros completos de filtro para la API
 */
export interface AssignmentFilterParams {
  pageNumber: number;
  pageSize: number;
  countries?: number[];
  cities?: number[];
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Parámetros de búsqueda por texto
 */
export interface AssignmentSearchParams {
  parameter: string;
  pageNumber: number;
  pageSize: number;
}

/**
 * Estado del formulario de filtros
 */
export interface FilterFormValue {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  countries: number[];
  cities: number[];
  enableCityFilter: boolean;
}
