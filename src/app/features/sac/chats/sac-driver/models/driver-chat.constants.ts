/**
 * Constantes para el módulo de chats SAC-Driver
 */

/**
 * Tipos de chat
 */
export const DRIVER_CHAT_TYPES = {
  HELP: 'help',
  ORDER: 'order'
} as const;

/**
 * Estados de usuario SAC
 */
export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BREAK: 'break'
} as const;

/**
 * Configuración de la UI
 */
export const UI_CONFIG = {
  MAX_MESSAGES_PER_LOAD: 50,
  MAX_IMAGE_SIZE_MB: 5,
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024,
  MAX_MESSAGE_LENGTH: 5000,
  NOTIFICATION_SOUND_PATH: 'assets/custom-media/bip.mp3',
  SCROLL_THRESHOLD_PX: 100
} as const;

/**
 * Configuración de imágenes
 */
export const IMAGE_CONFIG = {
  MAX_WIDTH: 2048,
  MAX_HEIGHT: 2048,
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  OPTIMIZE: true
} as const;

/**
 * Tipos de mensaje para backend
 */
export const MESSAGE_SENDER_TYPES = {
  DRIVER: 'Driver',
  SAC: 'SAC'
} as const;

/**
 * Tipo de chat para backend
 */
export const BACKEND_CHAT_TYPE = 'SD' as const;  // SAC-Driver
