/**
 * Interfaces compartidas para el módulo de reportes
 */

/**
 * Información de ciudad con datos de país
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
 * Información de driver por ciudad
 */
export interface DriverByCityList {
  idDriver: number;
  codeDriver: string;
  fullNameDriver: string;
}

/**
 * Información de restaurante por ciudad
 */
export interface RESTByCityList {
  restId: number;
  restBrandLogo: string;
  restAddress: string;
  restName: string;
  restShortName: string;
  restCityId: number;
  restCountryId: number;
}

/**
 * Información de marca/brand
 */
export interface BrandList {
  idBrand: number;
  nameBrand: string;
  logoBrand: string;
  sortOrderBrand: number;
}

/**
 * Información de restaurante por marca
 */
export interface RestByBrand {
  restId: number;
  shortName: string;
}

/**
 * Información de base de operaciones
 */
export interface BaseList {
  codHeadquarter: number;
  headquarterName: string;
}

/**
 * Enum para formatos de reporte
 */
export enum ReportFormat {
  PDF = 1,
  Excel = 2
}

/**
 * Opciones de formato para dropdown
 */
export interface FormatOption {
  id: ReportFormat;
  name: string;
}

/**
 * Opciones de formato por defecto
 */
export const FORMAT_OPTIONS: FormatOption[] = [
  { id: ReportFormat.PDF, name: 'PDF' },
  { id: ReportFormat.Excel, name: 'Excel' }
];
