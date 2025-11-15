import { ProductTagPosition, ALL_POSITION_OPTIONS, POSITION_OPTIONS } from '../models';

/**
 * Utilidades para trabajar con posiciones de tags de productos
 * Clase estática con métodos puros para manejo de posiciones
 */
export class ProductTagPositionUtils {

  /**
   * Obtiene la etiqueta/label de una posición
   * @param position - La posición del enum
   * @returns El label correspondiente o la posición original si no se encuentra
   */
  static getPositionLabel(position: ProductTagPosition | string): string {
    const positionOption = ALL_POSITION_OPTIONS.find(p => p.value === position);
    return positionOption ? positionOption.label : position.toString();
  }

  /**
   * Verifica si una posición está habilitada/disponible para usar
   * Solo 3 posiciones están habilitadas actualmente
   * @param position - La posición a verificar
   * @returns true si la posición está habilitada
   */
  static isPositionEnabled(position: ProductTagPosition | string): boolean {
    return POSITION_OPTIONS.some(p => p.value === position);
  }

  /**
   * Obtiene las clases CSS de Tailwind para posicionar el tag
   * Útil para preview en vivo del tag
   * @param position - La posición del tag
   * @returns Las clases CSS correspondientes
   */
  static getPositionClasses(position: ProductTagPosition | string): string {
    const classMap: Record<string, string> = {
      [ProductTagPosition.topLeft]: 'top-2 left-2',
      [ProductTagPosition.topCenter]: 'top-2 left-1/2 -translate-x-1/2',
      [ProductTagPosition.topRight]: 'top-2 right-2',
      [ProductTagPosition.bottomLeft]: 'bottom-2 left-2',
      [ProductTagPosition.bottomCenter]: 'bottom-2 left-1/2 -translate-x-1/2',
      [ProductTagPosition.bottomRight]: 'bottom-2 right-2'
    };

    return classMap[position.toString()] || '';
  }

  /**
   * Valida si un string es una posición válida del enum
   * @param position - El string a validar
   * @returns true si es una posición válida del enum
   */
  static isValidPosition(position: string): position is ProductTagPosition {
    return Object.values(ProductTagPosition).includes(position as ProductTagPosition);
  }

  /**
   * Obtiene el icono PrimeIcons correspondiente a una posición
   * @param position - La posición del tag
   * @returns El nombre del icono de PrimeIcons
   */
  static getPositionIcon(position: ProductTagPosition | string): string {
    const iconMap: Record<string, string> = {
      [ProductTagPosition.topLeft]: 'pi-arrow-up-left',
      [ProductTagPosition.topCenter]: 'pi-arrow-up',
      [ProductTagPosition.topRight]: 'pi-arrow-up-right',
      [ProductTagPosition.bottomLeft]: 'pi-arrow-down-left',
      [ProductTagPosition.bottomCenter]: 'pi-arrow-down',
      [ProductTagPosition.bottomRight]: 'pi-arrow-down-right'
    };

    return iconMap[position.toString()] || 'pi-map-marker';
  }
}
