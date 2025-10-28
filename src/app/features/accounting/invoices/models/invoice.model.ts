/**
 * Invoice Model - Interfaces para el módulo de Facturas
 *
 * IMPORTANTE: NO incluye transformaciones de datos.
 * Las interfaces reflejan exactamente la estructura del API.
 *
 * NOTA: Este es un módulo READ-ONLY (solo consulta, no creación/edición)
 */

/**
 * Invoice - Representa una factura en el listado
 */
export interface Invoice {
  CodFactura: number;
  FechaCreacionFactura: string; // ISO date string
  CodPais: number;
  Pais: string;
  CodCiudad: number;
  Ciudad: string;
  NumFactura: string; // Formato: "001-001-01-00000123"
  NumOrden: number;
  TotalFactura: number;
  CodEstadoFactura: string;
}

/**
 * InvoiceListResponse - Respuesta del endpoint de listado
 */
export interface InvoiceListResponse {
  data: Invoice[];
  metadata: {
    page: number;
    perPage: number;
    pageCount: number;
    totalCount: number;
  };
}

/**
 * InvoiceDetail - Detalles completos de una factura
 * (Vista de solo lectura - todos los campos del API)
 */
export interface InvoiceDetail {
  // Header
  numOrden: number;
  numFactura: string;
  fechaCreacionFactura: string; // ISO datetime
  posgcOrderId: number;
  invoiceUrl: string | null; // URL para descargar PDF (puede ser null)

  // Información de Empresa
  nombEmpresa: string;
  dirEmpresa: string;
  cai: string; // Código de Autorización Inicial
  rtn: string; // Registro Tributario Nacional
  telefono: string;
  correo: string;

  // Información de Cliente
  CodCliente: number;
  NameCliente: string;

  // Información de Orden
  tiempoEstimado: number; // minutos
  tiempoReal: number; // minutos
  fechaOrden: string; // ISO date
  horaInicio: string; // HH:MM:SS format
  horaFin: string; // HH:MM:SS format
  nombCanal: string;
  unidad: string;

  // Ubicación
  idPais: number;
  nombPais: string;
  idCiudad: number;
  nombCity: string;
  km: number; // Distancia en kilómetros

  // Cálculos Financieros
  subTotal: number;
  descuentoRebajas: number;
  importeGravado: number; // Monto sujeto a impuesto
  importeExonerado: number; // Monto exonerado de impuesto
  importeExento: number; // Monto exento de impuesto
  importeGravado15: number; // Monto sujeto a ISV 15%
  isv15: number; // ISV 15% calculado
  totalIsv: number; // Total de ISV (todas las tasas)
  valorDescuento: number;
  totalPagar: number; // Total final
  totalLetras: string; // Total en palabras

  // Pago y Administrativo
  idFormaPago: number;
  nameFormaPago: string;
  fechaLimite: string; // ISO date - Fecha límite de pago
  rangoAutorizado: string; // Rango de numeración autorizada
  invoiceChargeCost: number; // Costo de envío/cargo
}

/**
 * Country - País para filtros
 */
export interface Country {
  countryId: number;
  countryName: string;
  countryCode: string;
  isActive: boolean;
  countryPrefix: string;
  countryUrlFlag: string; // URL de la bandera
  countryMask: string;
}

/**
 * City - Ciudad para filtros
 */
export interface City {
  cityId: number;
  codCountry: number;
  countryName: string;
  cityName: string;
  cityCode: string;
  isActive: boolean;
  couponMin: number;
  publish: boolean;
  codZone: number;
  zoneName: string;
  orderMin: number;
  freeShipping: boolean;
  faCpayment: boolean;
}

/**
 * DateFilterOption - Opciones de filtro de fecha
 */
export interface DateFilterOption {
  id: number;
  name: string;
  value: 'current-hour' | 'last-24h' | 'this-week' | 'this-month' | 'custom';
}

/**
 * DateRange - Rango de fechas calculado
 */
export interface DateRange {
  dateFrom: Date;
  dateTo: Date;
}

/**
 * ReportType - Tipo de reporte a generar
 */
export enum ReportType {
  PDF = 1,
  Excel = 2
}

/**
 * VolChartsTotals - Datos de ventas totales para gráficos
 * API: GET /Invoice/GetInvoiceTotals
 */
export interface VolChartsTotals {
  timePeriod: string; // Formato varía según OptionTime
  totalAmount: number;
}

/**
 * VolChartsOrders - Datos de cantidad de órdenes para gráficos
 * API: GET /Invoice/GetQtyInvoices
 */
export interface VolChartsOrders {
  timePeriod: string; // Formato varía según OptionTime
  qtyInvoice: number;
}

/**
 * ChartDataset - Estructura de datos para Chart.js
 */
export interface ChartDataset {
  labels: string[]; // Etiquetas del eje X
  datasets: {
    label: string;
    data: number[];
    fill: boolean;
    backgroundColor: string;
    borderColor: string;
    tension: number;
  }[];
}

/**
 * Convierte datos de ventas totales a formato de gráfico (Días)
 */
export function convertToChartDataDays(
  data: VolChartsTotals[],
  label: string,
  color: string
): ChartDataset {
  const labels = data.map(item => item.timePeriod.substring(0, 5)); // DD/MM
  const values = data.map(item => item.totalAmount);

  return {
    labels,
    datasets: [{
      label,
      data: values,
      fill: true,
      backgroundColor: `${color}33`, // Agregar transparencia
      borderColor: color,
      tension: 0.4
    }]
  };
}

/**
 * Convierte datos de ventas totales a formato de gráfico (Horas)
 */
export function convertToChartDataHours(
  data: VolChartsTotals[],
  label: string,
  color: string
): ChartDataset {
  const labels = data.map(item => {
    const [date, time] = item.timePeriod.split(' ');
    const [day, month] = date.split('/');
    const [hour, minute] = time.split(':');

    const hourNum = parseInt(hour);
    const formattedHour = hourNum % 12 || 12;
    const amPm = hourNum >= 12 ? 'PM' : 'AM';

    return `${day}/${month} ${formattedHour}:${minute} ${amPm}`;
  });
  const values = data.map(item => item.totalAmount);

  return {
    labels,
    datasets: [{
      label,
      data: values,
      fill: true,
      backgroundColor: `${color}33`,
      borderColor: color,
      tension: 0.4
    }]
  };
}

/**
 * Convierte datos de ventas totales a formato de gráfico (Minutos)
 */
export function convertToChartDataMinutes(
  data: VolChartsTotals[],
  label: string,
  color: string
): ChartDataset {
  const labels = data.map(item => {
    const minutes = item.timePeriod.split(':')[1];
    return `${minutes} min`;
  });
  const values = data.map(item => item.totalAmount);

  return {
    labels,
    datasets: [{
      label,
      data: values,
      fill: true,
      backgroundColor: `${color}33`,
      borderColor: color,
      tension: 0.4
    }]
  };
}

/**
 * Convierte datos de órdenes a formato de gráfico (Días)
 */
export function convertToChartDataDaysOrders(
  data: VolChartsOrders[],
  label: string,
  color: string
): ChartDataset {
  const labels = data.map(item => item.timePeriod.substring(0, 5));
  const values = data.map(item => item.qtyInvoice);

  return {
    labels,
    datasets: [{
      label,
      data: values,
      fill: true,
      backgroundColor: `${color}33`,
      borderColor: color,
      tension: 0.4
    }]
  };
}

/**
 * Convierte datos de órdenes a formato de gráfico (Horas)
 */
export function convertToChartDataHoursOrders(
  data: VolChartsOrders[],
  label: string,
  color: string
): ChartDataset {
  const labels = data.map(item => {
    const [date, time] = item.timePeriod.split(' ');
    const [day, month] = date.split('/');
    const [hour, minute] = time.split(':');

    const hourNum = parseInt(hour);
    const formattedHour = hourNum % 12 || 12;
    const amPm = hourNum >= 12 ? 'PM' : 'AM';

    return `${day}/${month} ${formattedHour}:${minute} ${amPm}`;
  });
  const values = data.map(item => item.qtyInvoice);

  return {
    labels,
    datasets: [{
      label,
      data: values,
      fill: true,
      backgroundColor: `${color}33`,
      borderColor: color,
      tension: 0.4
    }]
  };
}

/**
 * Convierte datos de órdenes a formato de gráfico (Minutos)
 */
export function convertToChartDataMinutesOrders(
  data: VolChartsOrders[],
  label: string,
  color: string
): ChartDataset {
  const labels = data.map(item => {
    const minutes = item.timePeriod.split(':')[1];
    return `${minutes} min`;
  });
  const values = data.map(item => item.qtyInvoice);

  return {
    labels,
    datasets: [{
      label,
      data: values,
      fill: true,
      backgroundColor: `${color}33`,
      borderColor: color,
      tension: 0.4
    }]
  };
}
