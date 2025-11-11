import { FileFormat } from '../models';

/**
 * Limpia el string base64 removiendo prefijos data URI, comillas y espacios
 */
function cleanBase64(base64: string): string {
  let cleaned = base64.trim();

  // Remove data URI prefix if present
  if (cleaned.includes(',')) {
    cleaned = cleaned.split(',')[1];
  }

  // Remove surrounding quotes (API puede retornar base64 envuelto en comillas)
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }

  // Remove all whitespace characters
  cleaned = cleaned.replace(/[\r\n\s]+/g, '');

  return cleaned;
}

/**
 * Convierte string base64 a Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Dispara la descarga del archivo en el navegador
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  // Limpiar URL del objeto para liberar memoria
  window.URL.revokeObjectURL(url);
}

/**
 * Descarga un archivo Excel desde una cadena base64
 *
 * @param base64 - Cadena base64 del archivo Excel
 * @param filename - Nombre del archivo (sin extensión)
 */
export function downloadExcelFromBase64(base64: string, filename: string): void {
  const cleaned = cleanBase64(base64);
  const blob = base64ToBlob(
    cleaned,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  triggerDownload(blob, `${filename}.xlsx`);
}

/**
 * Descarga un archivo PDF desde una cadena base64
 *
 * @param base64 - Cadena base64 del archivo PDF
 * @param filename - Nombre del archivo (sin extensión)
 */
export function downloadPDFFromBase64(base64: string, filename: string): void {
  const cleaned = cleanBase64(base64);
  const blob = base64ToBlob(cleaned, 'application/pdf');
  triggerDownload(blob, `${filename}.pdf`);
}

/**
 * Descarga un archivo Excel legacy (.xlsx) desde una cadena base64
 *
 * @param base64 - Cadena base64 del archivo Excel
 * @param filename - Nombre del archivo (sin extensión)
 */
export function downloadExcelLegacyFromBase64(base64: string, filename: string): void {
  const cleaned = cleanBase64(base64);
  const blob = base64ToBlob(cleaned, 'application/vnd.ms-excel');
  triggerDownload(blob, `${filename}.xlsx`);
}

/**
 * Descarga un archivo desde base64 según el formato especificado
 *
 * @param base64 - Cadena base64 del archivo
 * @param filename - Nombre del archivo (sin extensión)
 * @param format - Formato del archivo (PDF o Excel)
 */
export function downloadFileFromBase64(
  base64: string,
  filename: string,
  format: FileFormat
): void {
  switch (format) {
    case FileFormat.PDF:
      downloadPDFFromBase64(base64, filename);
      break;
    case FileFormat.Excel:
    case FileFormat.ExcelLegacy:
      downloadExcelFromBase64(base64, filename);
      break;
    default:
      throw new Error(`Formato de archivo no soportado: ${format}`);
  }
}

/**
 * Formatea una fecha para usar en el nombre de un archivo
 *
 * @param date - Fecha a formatear
 * @returns Fecha formateada como yyyy-MM-dd
 */
export function formatDateForFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Genera un nombre de archivo para reporte con fechas
 *
 * @param reportName - Nombre base del reporte
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @param extension - Extensión del archivo (opcional, se agrega automáticamente)
 * @returns Nombre completo del archivo
 */
export function generateReportFilename(
  reportName: string,
  startDate: Date,
  endDate: Date,
  extension?: string
): string {
  const start = formatDateForFilename(startDate);
  const end = formatDateForFilename(endDate);
  const base = `${reportName}_${start}_${end}`;

  return extension ? `${base}.${extension}` : base;
}

/**
 * Formatea una fecha al formato ISO requerido por el backend (yyyy-MM-dd)
 *
 * @param date - Fecha a formatear
 * @returns Fecha en formato yyyy-MM-dd
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formatea una fecha SIN padding para el servicio de reportes (yyyy-M-d)
 *
 * @param date - Fecha a formatear
 * @returns Fecha en formato yyyy-M-d (sin ceros a la izquierda)
 */
export function formatDateForReportService(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month}-${day}`;
}
