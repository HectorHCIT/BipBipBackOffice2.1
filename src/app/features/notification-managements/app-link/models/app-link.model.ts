/**
 * App Link (Dynamic Links) Models
 * Models for managing deep links to products in the mobile app
 */

/**
 * Dynamic Link Product (main entity from API)
 */
export interface DynamicLinkProduct {
  dynamicLinkXProductId: number;
  brandId: number;
  brandName: string | null;
  urlBrandLogo: string | null;
  imageUrl: string;
  title: string;
  description: string;
  deepLink: string;
  isActive: boolean;
  productCode: string | null;
  productName: string | null;
  createdAt: string;
  channelId: number | null;     // null = "all channels"
  cityId: number | null;         // null = "all cities"
  campaignName: string | null;
}

/**
 * Create/Update App Link DTO
 */
export interface CreateUpdateAppLinkRequest {
  brandId: number;
  productCode: string;
  urlDynamicLink: string;
  descriptionLinkDynamic: string;
  titleLinkDynamic: string;
  pathImage: string;
  isActive: boolean;
  channelId: number | null;
  cityId: number | null;
  campaignName: string;
}

/**
 * Product from catalog
 */
export interface ProductData {
  productId: number;
  productCode: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  brandId: number;
  imageUrl: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMetadata {
  totalActive: number;
  totalInactive: number;
  page: number;
  perPage: number;
  pageCount: number;
  totalCount: number;
}

/**
 * Paginated response from API
 */
export interface DynamicLinkProductResponse {
  data: DynamicLinkProduct[];
  metadata: PaginationMetadata;
}

/**
 * Filter options for app links list
 */
export interface AppLinkFilters {
  status?: boolean | null;    // true = active, false = inactive, null = all
  search?: string;             // search by title or product
  page: number;
  pageSize: number;
}

/**
 * Status filter options for UI
 */
export interface StatusFilterOption {
  label: string;
  value: boolean | null;
}

/**
 * Status filter options
 */
export const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { label: 'Todos', value: null },
  { label: 'Activos', value: true },
  { label: 'Inactivos', value: false },
];
