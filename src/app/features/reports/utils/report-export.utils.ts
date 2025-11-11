import { formatDate } from '@angular/common';

/**
 * Formatea una fecha usando el pipe de Angular
 *
 * @param value - Fecha a formatear
 * @param format - Formato deseado (default: 'dd-MM-yyyy')
 * @returns String con la fecha formateada
 */
export const formatToDate = (value: Date | string, format = 'dd-MM-yyyy'): string =>
  formatDate(value, format, 'es');

/**
 * Convierte base64 a Blob y lo descarga como PDF
 *
 * @param value - String base64 (puede incluir prefijo data:)
 * @param name - Nombre del archivo sin extensión
 */
export function exportPDF(value: string, name: string): void {
  const base64Cleaned = value.includes(',') ? value.split(',')[1] : value;
  const byteCharacters = atob(base64Cleaned);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${name}.pdf`;
  link.click();

  window.URL.revokeObjectURL(url);
}

/**
 * Convierte base64 a Blob y lo descarga como Excel (.xlsx)
 * Formato: Excel 97-2003
 *
 * @param value - String base64 (puede incluir prefijo data:)
 * @param name - Nombre del archivo sin extensión
 */
export function exportExcel(value: string, name: string): void {
  const base64Cleaned = value.includes(',') ? value.split(',')[1] : value;
  const byteCharacters = atob(base64Cleaned);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/vnd.ms-excel' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${name}.xlsx`;
  link.click();

  window.URL.revokeObjectURL(url);
}

/**
 * Convierte base64 a Blob y lo descarga como Excel (.xlsx)
 * Formato: Excel 2007+
 *
 * @param value - String base64 (puede incluir prefijo data:)
 * @param name - Nombre del archivo sin extensión
 */
export function exportExcelXLSX(value: string, name: string): void {
  const base64Cleaned = value.includes(',') ? value.split(',')[1] : value;
  const byteCharacters = atob(base64Cleaned);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${name}.xlsx`;
  link.click();

  window.URL.revokeObjectURL(url);
}

/**
 * Formatea una fecha como DD-MM-YYYY
 *
 * @param date - Fecha a formatear
 * @returns String en formato DD-MM-YYYY
 */
export function getDateFormat(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Formatea una fecha como YYYY-MM-DD (ISO)
 *
 * @param date - Fecha a formatear
 * @returns String en formato YYYY-MM-DD
 */
export function getDateFormatISO(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}
