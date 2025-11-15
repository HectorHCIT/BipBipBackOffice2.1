/**
 * Modelo de producto en promoción
 */
export interface ProductInPromotion {
  /** Identificador único: "brandId:productId" */
  index: string;
  /** ID del producto */
  productId: string;
  /** ID de la marca */
  brandId: string;
  /** Color de fondo del tag (formato hex) */
  backgroundColor: string;
  /** Color del texto del tag (formato hex) */
  textColor: string;
  /** Texto del tag promocional (máximo 50 caracteres) */
  text: string;
  /** Posición del tag en la imagen del producto */
  position: string;
  /** Precio anterior (opcional, para mostrar descuento) */
  oldPrice?: string;
}

/**
 * Respuesta paginada de productos en promoción
 */
export interface ProductInPromotionResponse {
  data: ProductInPromotion[];
  metadata: {
    totalCount: number;
    page: number;
    perPage: number;
    pageCount: number;
  };
}

/**
 * Respuesta vacía por defecto
 */
export const productInPromotionEmpty: ProductInPromotionResponse = {
  data: [],
  metadata: {
    totalCount: 0,
    page: 1,
    perPage: 10,
    pageCount: 0
  }
};

/**
 * DTO para crear o actualizar un producto en promoción
 */
export interface CreateProductInPromotion {
  index?: string;
  productId: string;
  brandId: string;
  backgroundColor: string;
  textColor: string;
  text: string;
  position: string;
  oldPrice?: string;
}

/**
 * Datos de producto obtenidos del servicio de incentivos
 */
export interface ProductData {
  productId: string;
  name: string;
  description: string;
  price: string;
  brand: string;
  brandId?: number;
  imageUrl: string;
}

/**
 * Datos resumidos de marca
 */
export interface BrandShortList {
  id: string;
  name: string;
  imageUrl?: string;
}
