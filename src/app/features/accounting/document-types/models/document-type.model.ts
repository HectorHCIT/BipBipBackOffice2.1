/**
 * Document Type Models
 *
 * NO hacemos transformaciones - usamos directamente el modelo del backend
 * para mantener consistencia con la API
 */

/**
 * DocumentType - Modelo principal de tipo de documento
 * Viene directo del endpoint: DocumentType/DocumentTypesList
 */
export interface DocumentType {
  docTypeId: number;
  docTypeName: string;
  docTypeNumb: string;
  isActive: boolean;
}

/**
 * DocumentTypeDetail - Detalles completos de un tipo de documento
 * Endpoint: DocumentType/DocumentTypesDetail
 */
export interface DocumentTypeDetail {
  docTypeId: number;
  docTypeNumb: string;
  docTypeName: string;
  isActive: boolean;
  dateCreated: string;
  userCreated: string;
  dateModified: string;
  userModified: string;
}

/**
 * DocumentTypeListResponse - Respuesta del endpoint con paginación
 */
export interface DocumentTypeListResponse {
  data: DocumentType[];
  metadata: PaginationMetadata;
}

/**
 * PaginationMetadata - Metadatos de paginación del servidor
 */
export interface PaginationMetadata {
  page: number;
  perPage: number;
  pageCount: number;
  totalCount: number;
  totalActive: number;
  totalInactive: number;
}

/**
 * CreateDocumentTypeRequest - Request para crear tipo de documento
 * Endpoint: DocumentType/CreateDocumentType
 */
export interface CreateDocumentTypeRequest {
  nombreTipoDocumento: string;
  codPais: number;
  numeroTipoDocumento: string;
  activo: boolean;
}

/**
 * UpdateDocumentTypeRequest - Request para actualizar tipo de documento
 * Endpoint: DocumentType/EditDocumentType
 */
export interface UpdateDocumentTypeRequest {
  nombreTipoDocumento: string;
  codPais: number;
  numeroTipoDocumento: string;
  activo: boolean;
}

/**
 * StatusFilter - Filtros de estado disponibles
 */
export interface StatusFilter {
  idStatus: number;
  label: string;
  filter: string | null;
  qty: number;
}

/**
 * Country - Modelo de país (para el selector)
 */
export interface Country {
  idPais: number;
  nombrePais: string;
  imageSrc: string;
  moneda: string;
  currentSymbol: string;
}
