/**
 * Tip Models
 * Interfaces para gestión de propinas por país/moneda
 */

/**
 * Configuración de propina en lista
 */
export interface TipList {
  idCountry: number;
  nameCountry: string;
  idCurrency: number;
  symbCurrency: string;
  titleCurrency: string;
  tipDefault: boolean;
  valueDefault: number[];
  isCustomizedTips: boolean;
  valueMinAmount: string;
  isActiveTip: boolean;
}

/**
 * Detalle de configuración de propina (para edición)
 */
export interface TipDetail {
  idCountry: number;
  nameCountry: string;
  idCurrency: number;
  symbCurrency: string;
  titleCurrency: string;
  tipDefault: boolean;
  tipDefVal: TipDefaultValue[];
  isCustomizedTips: boolean;
  valueMinAmount: string;
}

/**
 * Valor de propina por defecto
 */
export interface TipDefaultValue {
  idTipValDef: number;  // 1-4
  activeTip: boolean;   // Si está publicada
  valTip: number;       // Valor de la propina
}

/**
 * Payload para actualizar configuración de propinas
 */
export interface TipPayload {
  addTip: boolean;          // Permitir propinas personalizadas
  minTip: number;           // Monto mínimo para propinas personalizadas
  addTipDefault: boolean;   // Habilitar propinas por defecto
  maxTips: MaxTip[];        // Hasta 4 propinas por defecto
}

/**
 * Propina por defecto en payload
 */
export interface MaxTip {
  maxTip: number;      // Valor de la propina
  isPublish: boolean;  // Si se publica al usuario
}
