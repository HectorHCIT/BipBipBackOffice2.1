/**
 * Loyalty Program Models
 * Modern TypeScript interfaces for the loyalty program module
 */

/**
 * Loyalty Level (main entity)
 */
export interface LoyaltyLevel {
  idLoyaltyLevel: number;
  loyaltyLevelName: string;
  minPointsLevel: number;
  maxPointsLevel: number;
  iconLevel: string;
  inOrder: number;
  isActive: boolean;
  isPublish: boolean;
  messageLevel: string;
  hexavalue?: string;
  loyaltyItemsWalletList: LoyaltyBenefit[];
}

/**
 * Loyalty Benefit (reward within a level)
 */
export interface LoyaltyBenefit {
  idLoyaltyItemWallet: number;
  codLoyaltyLevel: number;
  loyaltyNameWallet: string;
  loyaltyDescriptionWallet: string;
  benefitType?: BenefitType;
  iconBenefit?: string;
  loyaltyItemProducto: LoyaltyProduct[];
}

/**
 * Loyalty Product (product included in benefit)
 */
export interface LoyaltyProduct {
  codItemProduct: number;
  brandId: number;
  active: boolean;
  productCode: string;
  productName?: string;
  loyaltyItemModifiers: LoyaltyModifier[];
}

/**
 * Loyalty Modifier (modifier for a product)
 */
export interface LoyaltyModifier {
  codLoyaltyItemModifier: number;
  codItemProduct: number;
  quantity: number;
  active: boolean;
  publish: boolean;
  modifierId: string;
  modifierCode: string;
  modifierName?: string;
}

/**
 * Create/Update Loyalty Level DTO
 */
export interface CreateLoyaltyLevelRequest {
  loyaltyLevelName: string;
  minPointsLevel: number;
  maxPointsLevel: number;
  idLoyaltyInfo: number;
  inOrder: number;
  isActive: boolean;
  isPublish: boolean;
  hexavalue: string;
  messageLevel: string;
  iconLevel?: string;
}

/**
 * Update Loyalty Level Status
 */
export interface UpdateLevelStatusRequest {
  levelId: number;
  status: boolean;
}

/**
 * Product from catalog
 */
export interface Product {
  productId: string;
  name: string;
  description: string;
  brand: string;
  brandId?: number;
  imageUrl: string;
  price?: string;
}

/**
 * Modifier Option
 */
export interface ModifierOption {
  modifierOptionId: string;
  modifierId: string;
  name: string;
  price: number;
}

/**
 * Modifier from catalog
 */
export interface Modifier {
  codPromo: string;
  brand: string;
  name: string;
  modifierId: string;
  options: ModifierOption[];
}

/**
 * Brand entity
 */
export interface Brand {
  idBrand: number;
  nameBrand: string;
  logoBrand: string;
  imageBrand: string;
  imageMenuBrand: string;
  shortNameBrand: string;
  isSendOrder: boolean;
  urlLogoHeader: string;
  codePayingPosgc: number;
  isActiveBrand: boolean;
  position: number;
  totalRestaurants: number;
}

/**
 * Level Icon
 */
export interface LevelIcon {
  id: number;
  name: string;
  levelIcon: string;
}

/**
 * Image Upload Response
 */
export interface UploadImageResponse {
  presignedUrl: string;
  url: string;
}

/**
 * Min/Max Points validation
 */
export interface MinMaxPoints {
  name: string;
  minPointsLevel: number;
  maxPointsLevel: number;
}

/**
 * Benefit Types Enum
 */
export enum BenefitType {
  EG = 'Envio Gratis',
  AG = 'Aperitivo Gratis',
  PG = 'Postres Gratis',
  DF = 'Descuento Fijo',
  DP = 'Descuento Porcentual',
}

export type BenefitCode = keyof typeof BenefitType;

/**
 * API Response for modifiers
 */
export interface ModifierResponse {
  modifiers: Modifier[];
}

/**
 * API Response for products
 */
export interface ProductResponse {
  products: Product[];
}

/**
 * Filter state for loyalty levels table
 */
export interface LoyaltyLevelFilters {
  search?: string;
  isActive?: boolean;
  page: number;
  pageSize: number;
}

/**
 * Paginated response for loyalty levels
 */
export interface PaginatedLoyaltyLevelsResponse {
  data: LoyaltyLevel[];
  metadata: {
    totalActive: number;
    totalInactive: number;
    page: number;
    perPage: number;
    pageCount: number;
    totalCount: number;
  };
}
