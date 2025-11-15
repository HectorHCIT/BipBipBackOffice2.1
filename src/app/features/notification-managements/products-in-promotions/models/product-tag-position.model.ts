/**
 * Enum para las posiciones del tag del producto
 * Alineado con la estructura de Flutter en la app móvil
 */
export enum ProductTagPosition {
  topCenter = 'topCenter',
  topLeft = 'topLeft',
  topRight = 'topRight',
  bottomCenter = 'bottomCenter',
  bottomLeft = 'bottomLeft',
  bottomRight = 'bottomRight'
}

/**
 * Opción de posición para select/dropdown
 */
export interface PositionOption {
  value: ProductTagPosition;
  label: string;
}

/**
 * Posiciones habilitadas actualmente (solo 3 disponibles)
 * Se limitan para mantener consistencia visual en la app
 */
export const POSITION_OPTIONS: PositionOption[] = [
  { value: ProductTagPosition.topLeft, label: 'Superior Izquierda' },
  { value: ProductTagPosition.topRight, label: 'Superior Derecha' },
  { value: ProductTagPosition.bottomRight, label: 'Inferior Derecha' }
];

/**
 * Todas las opciones del enum (para referencia futura)
 * En caso de que se habiliten más posiciones en el futuro
 */
export const ALL_POSITION_OPTIONS: PositionOption[] = [
  { value: ProductTagPosition.topLeft, label: 'Superior Izquierda' },
  { value: ProductTagPosition.topCenter, label: 'Superior Centro' },
  { value: ProductTagPosition.topRight, label: 'Superior Derecha' },
  { value: ProductTagPosition.bottomLeft, label: 'Inferior Izquierda' },
  { value: ProductTagPosition.bottomCenter, label: 'Inferior Centro' },
  { value: ProductTagPosition.bottomRight, label: 'Inferior Derecha' }
];
