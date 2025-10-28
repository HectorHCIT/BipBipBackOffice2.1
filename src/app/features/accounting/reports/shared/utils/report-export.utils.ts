/**
 * Report Export Utilities
 *
 * Funciones standalone para convertir base64 a archivos y descargarlos.
 * Soporta PDF, Excel (.xls), y Excel (.xlsx)
 *
 * IMPORTANTE: NO transformamos datos, solo manejamos descarga de archivos.
 */

/**
 * Convierte base64 string a PDF y descarga el archivo
 *
 * @param base64 - String base64 (puede incluir prefijo 'data:application/pdf;base64,')
 * @param filename - Nombre del archivo sin extensión
 *
 * @example
 * downloadPDF(base64String, 'reporte-ventas-2024');
 * // Descarga: reporte-ventas-2024.pdf
 */
export function downloadPDF(base64: string, filename: string): void {
  const cleaned = cleanBase64(base64);
  const blob = base64ToBlob(cleaned, 'application/pdf');
  triggerDownload(blob, `${filename}.pdf`);
}

/**
 * Convierte base64 string a Excel (.xls) y descarga el archivo
 *
 * @param base64 - String base64
 * @param filename - Nombre del archivo sin extensión
 *
 * @example
 * downloadExcel(base64String, 'reporte-ventas-2024');
 * // Descarga: reporte-ventas-2024.xls
 */
export function downloadExcel(base64: string, filename: string): void {
  const cleaned = cleanBase64(base64);
  const blob = base64ToBlob(cleaned, 'application/vnd.ms-excel');
  triggerDownload(blob, `${filename}.xls`);
}

/**
 * Convierte base64 string a Excel (.xlsx) y descarga el archivo
 * Formato moderno de Excel (Office 2007+)
 *
 * @param base64 - String base64
 * @param filename - Nombre del archivo sin extensión
 *
 * @example
 * downloadExcelXLSX(base64String, 'reporte-ventas-2024');
 * // Descarga: reporte-ventas-2024.xlsx
 */
export function downloadExcelXLSX(base64: string, filename: string): void {
  const cleaned = cleanBase64(base64);
  const blob = base64ToBlob(
    cleaned,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  triggerDownload(blob, `${filename}.xlsx`);
}

/**
 * Limpia el string base64 removiendo prefijos data URI si existen
 *
 * @param base64 - String base64 con o sin prefijo
 * @returns String base64 limpio
 *
 * @example
 * cleanBase64('data:application/pdf;base64,JVBERi0x...')
 * // Retorna: 'JVBERi0x...'
 *
 * cleanBase64('JVBERi0x...')
 * // Retorna: 'JVBERi0x...' (sin cambios)
 */
function cleanBase64(base64: string): string {
  return base64.includes(',') ? base64.split(',')[1] : base64;
}

/**
 * Convierte string base64 a Blob
 *
 * @param base64 - String base64 limpio (sin prefijo)
 * @param mimeType - Tipo MIME del archivo
 * @returns Blob con los datos binarios
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
 *
 * @param blob - Blob con los datos del archivo
 * @param filename - Nombre completo del archivo (con extensión)
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
