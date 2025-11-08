/**
 * Representa una solución asociada a una ocurrencia/incidencia
 */
export interface Solution {
  /** Descripción de la solución proporcionada */
  solution: string;

  /** Fecha y hora de creación de la solución (ISO string) */
  createdAt: string;

  /** Usuario que creó la solución */
  createdBy: string;

  /** Persona encargada de atender la incidencia */
  attendant: string;
}

/**
 * Representa una ocurrencia/incidencia en el sistema
 */
export interface Occurrence {
  /** Identificador único de la ocurrencia */
  id: number;

  /** Fecha y hora de creación (ISO string) */
  createdAt: string;

  /** Usuario que reportó la ocurrencia */
  createdBy: string;

  /** Número de orden asociada */
  orderId: string;

  /** Identificador POSGC */
  posgc: string;

  /** Tipo de incidencia */
  type: string;

  /** Canal por el que se reportó */
  channel: string;

  /** Razón de la incidencia */
  reason: string;

  /** Unidad/tienda donde ocurrió */
  store: string;

  /** Comentarios adicionales */
  comments: string;

  /** Lista de soluciones asociadas */
  solution: Solution[];
}

/**
 * DTO para editar/agregar solución a una ocurrencia
 */
export interface EditOccurrenceDto {
  /** Código de la incidencia */
  codIncident: number;

  /** Texto de la solución */
  solution: string;

  /** Nombre del atendente */
  attendance: string;
}

/**
 * Parámetros para filtrar el reporte de ocurrencias
 */
export interface OccurrenceReportFilters {
  /** Fecha de inicio (ISO string) */
  fechaInicio: string;

  /** Fecha de fin (ISO string) */
  fechaFinal: string;

  /** IDs de marcas seleccionadas (separadas por coma) */
  marcas: string;

  /** IDs de ciudades seleccionadas (separadas por coma) */
  ciudades: string;
}

/**
 * Tipo de incidencia disponible en el sistema
 */
export interface OccurrenceType {
  /** Identificador del tipo */
  id: number;

  /** Nombre del tipo de incidencia */
  name: string;
}

/**
 * Razón de incidencia según el tipo
 */
export interface OccurrenceReason {
  /** Identificador de la razón */
  id: number;

  /** Descripción de la razón */
  description: string;

  /** Tipo al que pertenece */
  type: string;
}
