/**
 * Personalized Alert Models
 * Modern TypeScript interfaces for the personalized alerts module
 */

/**
 * Personalized Alert (main entity)
 */
export interface PersonalizedAlert {
  code: string;
  codePointIcon: string;
  textColor: string;
  backgroundColor: string;
  title: string;
  subtitle: string;
}

/**
 * Create/Update Personalized Alert DTO
 */
export interface CreateUpdatePersonalizedAlertRequest {
  code: string;
  codePointIcon: string;
  textColor: string;
  backgroundColor: string;
  title: string;
  subtitle: string;
}

/**
 * Common icon options for alerts
 */
export interface AlertIcon {
  id: string;
  value: string;
  image: string;
}

/**
 * Common alert icons catalog (SVG files from public/alert-custom/)
 */
export const COMMON_ALERT_ICONS: AlertIcon[] = [
  { id: 'info', value: 'Información', image: '/alert-custom/info.svg' },
  { id: 'warning', value: 'Advertencia', image: '/alert-custom/warning.svg' },
  { id: 'rain', value: 'Lluvia', image: '/alert-custom/rain.svg' },
];

/**
 * Color presets for alerts
 */
export interface ColorPreset {
  name: string;
  textColor: string;
  backgroundColor: string;
}

/**
 * Common color combinations for alerts
 */
export const ALERT_COLOR_PRESETS: ColorPreset[] = [
  { name: 'Error Rojo', textColor: 'FFFFFF', backgroundColor: 'DC2626' },
  { name: 'Advertencia Amarilla', textColor: '000000', backgroundColor: 'FBBF24' },
  { name: 'Info Azul', textColor: 'FFFFFF', backgroundColor: '3B82F6' },
  { name: 'Éxito Verde', textColor: 'FFFFFF', backgroundColor: '10B981' },
  { name: 'Neutral Gris', textColor: 'FFFFFF', backgroundColor: '6B7280' },
  { name: 'Morado', textColor: 'FFFFFF', backgroundColor: '8B5CF6' },
  { name: 'Rosa', textColor: 'FFFFFF', backgroundColor: 'EC4899' },
  { name: 'Naranja', textColor: 'FFFFFF', backgroundColor: 'F97316' },
];
