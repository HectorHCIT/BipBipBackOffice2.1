/**
 * Channel Models
 * Interfaces para gestión de canales de comunicación en la app móvil
 */

/**
 * Marca asociada a un canal (UI version con isSelected)
 */
export interface Brand {
  idBrand: number;
  brandName: string;
  logoUrl: string;
  isSelected: boolean;
}

/**
 * Marca desde la API (sin isSelected)
 */
export interface BrandAPI {
  idBrand: number;
  nameBrand: string;
  logoBrand: string;
}

/**
 * Canal en lista (con marcas de API)
 */
export interface ChannelList {
  idChannel: number;
  descriptionChannel: string;
  isVisibleChannel: boolean;
  isActiveChannel: boolean;
  positionChannel: number;
  typeChannel: string;
  iconUrlChannel: string;
  brandsList: BrandAPI[]; // API devuelve BrandAPI sin isSelected
}

/**
 * Canal completo (con instrucciones)
 */
export interface Channel extends ChannelList {
  instructionsChannel: string;
  fullNameTypeChannel?: string;
  descTypeChannel?: string;
}

/**
 * Canal en lista para UI (con marcas UI que tienen isSelected)
 */
export interface ChannelListUI {
  idChannel: number;
  descriptionChannel: string;
  isVisibleChannel: boolean;
  isActiveChannel: boolean;
  positionChannel: number;
  typeChannel: string;
  iconUrlChannel: string;
  brandsList: Brand[]; // UI usa Brand con isSelected
}

/**
 * Payload para crear/actualizar canal (API request)
 */
export interface ChannelPayload {
  channelName: string;
  instructionChannel: string;
  isVisible: boolean;
  isActive: boolean;
  isPublish?: boolean;
  timePush?: number;
  typeChannel: string;
  fullNameTypeChannel?: string;
  descTypeChannel?: string;
  codBrands: number[]; // Solo IDs de marcas
}

/**
 * Tipos de canal disponibles
 */
export enum ChannelType {
  WhatsApp = 'WhatsApp',
  Messenger = 'Messenger',
  Instagram = 'Instagram',
  Telegram = 'Telegram',
  Other = 'Other'
}
