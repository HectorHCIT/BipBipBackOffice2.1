/**
 * Parámetros base para reportes SAC
 */
export interface BaseReportParams {
  /** Fecha de inicio del reporte */
  fechaInicio: string; // Formato: yyyy-MM-dd

  /** Fecha de fin del reporte */
  fechaFinal: string; // Formato: yyyy-MM-dd
}

/**
 * Rango de fechas para filtros
 */
export interface DateRange {
  /** Fecha de inicio */
  startDate: Date;

  /** Fecha de fin */
  endDate: Date;
}

/**
 * Parámetros para reporte de asignaciones
 */
export interface AssignmentsReportParams extends BaseReportParams {
  // Solo usa fechas base
}

/**
 * Parámetros para reporte de ocurrencias
 */
export interface OccurrencesReportParams extends BaseReportParams {
  /** IDs de marcas seleccionadas */
  marcas?: number[];

  /** IDs de ciudades seleccionadas */
  ciudades?: number[];
}

/**
 * Parámetros para reporte de chat SAC
 *
 * NOTA: Este reporte usa URLs dinámicas con path parameters,
 * no requiere interface de parámetros tradicional.
 * URLs: reporteria/reporteChatXFecha/{inicio}/{final}/{tipo}
 *       reporteria/reporteChatXUsuario/{inicio}/{final}/{tipo}
 */
export interface ChatReportParams extends BaseReportParams {
  // Mantener interface por compatibilidad, pero no se usa en implementación actual
}

/**
 * Parámetros para reporte de detalle de chat
 */
export interface ChatDetailsReportParams extends BaseReportParams {
  /** Nombre del usuario/agente o "TODOS" */
  nameUser: string;
}

/**
 * Interface para agentes de chat
 */
export interface Agentes {
  /** Nombre del agente */
  agentName: string;
}

/**
 * Tipo de reporte de beneficios
 */
export enum BenefitReportType {
  /** Reporte de Beneficios */
  Benefits = 1,

  /** Reporte de Puntos Bips */
  BipsPoints = 2
}

/**
 * Parámetros para reporte de control de beneficios
 */
export interface BenefitsReportParams extends BaseReportParams {
  // No requiere parámetros adicionales, el tipo se maneja en el componente
}

/**
 * Parámetros para reporte de tiempo de entrega
 */
export interface DeliveryTimeReportParams extends BaseReportParams {
  /** Formato del archivo (pdf o xlsx) */
  format: FileFormat;
}

/**
 * Formato de archivo para descarga
 */
export enum FileFormat {
  /** Formato PDF */
  PDF = 'pdf',

  /** Formato Excel (.xlsx) */
  Excel = 'xlsx',

  /** Formato Excel (.xlsx) - legacy */
  ExcelLegacy = 'xls'
}

/**
 * Estado de generación de reporte
 */
export interface ReportGenerationState {
  /** Indica si está cargando */
  isLoading: boolean;

  /** Mensaje de error si falla */
  error?: string;

  /** Indica si fue exitoso */
  success: boolean;
}
