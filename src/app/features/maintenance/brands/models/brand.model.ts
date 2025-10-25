/**
 * Brand - Modelo de marca (viene directo del API)
 *
 * NO hacemos transformaciones - usamos directamente el modelo del backend
 */
export interface Brand {
  idBrand: number;
  nameBrand: string;
  shortNameBrand: string;
  logoBrand: string;
  urlLogoHeader: string;
  imageMenuBrand: string;
  isActiveBrand: boolean;
  isSendOrder: boolean;
  codePayingPosgc: number;
  position: number;
  totalRestaurants?: number;
}

/**
 * Create Brand Request - Datos para crear una nueva marca
 */
export interface CreateBrandRequest {
  nameBrand: string;
  shortNameBrand: string;
  logoBrand: string;
  logoHeaderBrand: string;
  imageMenuBrand: string;
  isActiveBrand: boolean;
  isSendOrder: boolean;
  codePayingPosgc: number;
  position: number;
}

/**
 * Update Brand Request - Datos para actualizar una marca
 */
export interface UpdateBrandRequest {
  nameBrand: string;
  shortNameBrand: string;
  logoBrand: string;
  logoHeaderBrand: string;
  imageMenuBrand: string;
  isActiveBrand: boolean;
  isSendOrder: boolean;
  codePayingPosgc: number;
  position: number;
}

/**
 * Update Position Request - Para actualizar posiciones en drag & drop
 */
export interface UpdatePositionRequest {
  idBrand: number;
  positionBrand: number;
}

/**
 * Brand Status - Estados de filtro
 */
export enum BrandStatus {
  Active = 'Activos',
  Inactive = 'Inactivos'
}
