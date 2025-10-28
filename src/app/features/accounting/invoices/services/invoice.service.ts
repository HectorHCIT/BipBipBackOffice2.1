import { Injectable, signal, computed, inject } from '@angular/core';
import { DataService } from '@core/services/data.service';
import { Observable, tap } from 'rxjs';
import {
  Invoice,
  InvoiceDetail,
  InvoiceListResponse,
  Country,
  City,
  DateFilterOption,
  DateRange,
  ReportType,
  VolChartsTotals,
  VolChartsOrders
} from '../models/invoice.model';

/**
 * InvoiceService - Servicio para gestión de facturas
 *
 * Patrón: Signals para estado reactivo + DataService para HTTP
 * NO hacemos transformaciones de datos
 *
 * IMPORTANTE: Este es un módulo READ-ONLY (solo consulta)
 */
@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly dataService = inject(DataService);

  // Estado reactivo con Signals
  readonly invoices = signal<Invoice[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly totalAmount = signal<number>(0); // Suma total de montos
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(5);
  readonly isLoading = signal<boolean>(false);

  // Filtros de fecha
  readonly dateFrom = signal<Date | null>(null);
  readonly dateTo = signal<Date | null>(null);
  readonly selectedDateFilter = signal<number>(4); // Default: Este mes

  // Datos de referencia
  readonly countries = signal<Country[]>([]);
  readonly cities = signal<City[]>([]);

  // Datos de gráficos
  readonly chartTotalsData = signal<VolChartsTotals[]>([]);
  readonly chartOrdersData = signal<VolChartsOrders[]>([]);
  readonly isLoadingCharts = signal<boolean>(false);

  // Opciones de filtro de fecha
  readonly dateFilterOptions = signal<DateFilterOption[]>([
    { id: 1, name: 'Hora actual', value: 'current-hour' },
    { id: 2, name: 'Últimas 24 hrs', value: 'last-24h' },
    { id: 3, name: 'Esta semana', value: 'this-week' },
    { id: 4, name: 'Este mes', value: 'this-month' },
    { id: 5, name: 'Personalizado', value: 'custom' }
  ]);

  // Computed para total de páginas
  readonly totalPages = computed(() => {
    const total = this.totalRecords();
    const size = this.pageSize();
    return Math.ceil(total / size);
  });

  /**
   * Obtiene la lista de facturas con paginación y filtros de fecha opcionales
   * Endpoint: Invoice?pageNumber={n}&pageSize={n}&dateFrom={ISO}&dateTo={ISO}
   */
  getInvoices(
    page: number,
    pageSize: number,
    dateFrom?: Date | null,
    dateTo?: Date | null
  ): Observable<InvoiceListResponse> {
    this.isLoading.set(true);

    // Construir query params
    let url = `Invoice?pageNumber=${page + 1}&pageSize=${pageSize}`;

    // Agregar filtros de fecha si existen
    if (dateFrom) {
      url += `&dateFrom=${this.formatDateISO(dateFrom)}`;
    }
    if (dateTo) {
      url += `&dateTo=${this.formatDateISO(dateTo)}`;
    }

    return this.dataService.get$<InvoiceListResponse>(url).pipe(
      tap({
        next: (response) => {
          this.invoices.set(response.data);
          this.totalRecords.set(response.metadata.totalCount);

          // Calcular totalAmount manualmente sumando los TotalFactura
          const calculatedTotal = response.data.reduce(
            (sum, invoice) => sum + invoice.TotalFactura,
            0
          );
          this.totalAmount.set(calculatedTotal);

          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }

  /**
   * Obtiene el detalle completo de una factura
   * Endpoint: Invoice/{id}
   */
  getInvoiceById(id: number): Observable<InvoiceDetail> {
    return this.dataService.get$<InvoiceDetail>(`Invoice/${id}`);
  }

  /**
   * Genera un reporte de facturas en PDF o Excel
   * Endpoint: reporteFAC/detalleFacturas/{dateFrom}/{dateTo}/{type}
   *
   * @param type 1=PDF, 2=Excel
   * @param dateFrom Fecha inicio en formato D-M-Y (sin padding)
   * @param dateTo Fecha fin en formato D-M-Y (sin padding)
   * @returns Base64 string del archivo generado
   */
  generateReport(
    type: ReportType,
    dateFrom: Date,
    dateTo: Date
  ): Observable<string> {
    const fromStr = this.formatDateReport(dateFrom);
    const toStr = this.formatDateReport(dateTo);
    return this.dataService.get$<string>(
      `reporteFAC/detalleFacturas/${fromStr}/${toStr}/${type}`
    );
  }

  /**
   * Obtiene la lista de países
   * Endpoint: Location/CountryList
   */
  getCountries(): Observable<Country[]> {
    return this.dataService.get$<Country[]>('Location/CountryList').pipe(
      tap(countries => this.countries.set(countries))
    );
  }

  /**
   * Obtiene las ciudades de un país
   * Endpoint: Location/CityCountry?idCountry={id}
   */
  getCitiesByCountry(countryId: number): Observable<City[]> {
    return this.dataService.get$<City[]>(
      `Location/CityCountry?idCountry=${countryId}`
    ).pipe(
      tap(cities => this.cities.set(cities))
    );
  }

  /**
   * Calcula el rango de fechas según la opción seleccionada
   */
  calculateDateRange(optionId: number, customFrom?: Date, customTo?: Date): DateRange {
    const now = new Date();

    switch (optionId) {
      case 1: // Hora actual (última hora)
        const oneHourAgo = new Date(now);
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        return { dateFrom: oneHourAgo, dateTo: now };

      case 2: // Últimas 24 horas
        const oneDayAgo = new Date(now);
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        return { dateFrom: oneDayAgo, dateTo: now };

      case 3: // Esta semana (desde el lunes)
        const monday = new Date(now);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);
        monday.setHours(0, 0, 0, 0);
        return { dateFrom: monday, dateTo: now };

      case 4: // Este mes (desde el día 1)
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        firstDayOfMonth.setHours(0, 0, 0, 0);
        return { dateFrom: firstDayOfMonth, dateTo: now };

      case 5: // Personalizado
        if (customFrom && customTo) {
          return { dateFrom: customFrom, dateTo: customTo };
        }
        // Fallback a este mes si no se proporcionan fechas
        return this.calculateDateRange(4);

      default:
        // Default: este mes
        return this.calculateDateRange(4);
    }
  }

  /**
   * Formatea fecha a ISO (YYYY-MM-DD) para endpoints de lista
   */
  private formatDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Formatea fecha a D-M-Y (sin padding) para endpoint de reportes
   * Ejemplo: 15-10-2024
   */
  private formatDateReport(date: Date): string {
    const day = date.getDate(); // Sin padding
    const month = date.getMonth() + 1; // Sin padding
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /**
   * Obtiene datos de ventas totales para gráficos
   * Endpoint: GET /Invoice/GetInvoiceTotals?OptionTime={id}&dateFrom={ISO}&dateTo={ISO}
   *
   * @param optionTime 1=Hora actual, 2=24hrs, 3=Semana, 4=Mes, 5=Personalizado
   */
  getInvoiceTotals(
    optionTime: number,
    dateFrom?: Date | null,
    dateTo?: Date | null
  ): Observable<VolChartsTotals[]> {
    this.isLoadingCharts.set(true);

    let url = `Invoice/GetInvoiceTotals?OptionTime=${optionTime}`;

    if (dateFrom && dateTo && optionTime === 5) {
      url += `&dateFrom=${this.formatDateISO(dateFrom)}&dateTo=${this.formatDateISO(dateTo)}`;
    }

    return this.dataService.get$<VolChartsTotals[]>(url).pipe(
      tap({
        next: (data) => {
          this.chartTotalsData.set(data);
          this.isLoadingCharts.set(false);
        },
        error: () => {
          this.isLoadingCharts.set(false);
        }
      })
    );
  }

  /**
   * Obtiene datos de cantidad de órdenes para gráficos
   * Endpoint: GET /Invoice/GetQtyInvoices?OptionTime={id}&dateFrom={ISO}&dateTo={ISO}
   *
   * @param optionTime 1=Hora actual, 2=24hrs, 3=Semana, 4=Mes, 5=Personalizado
   */
  getQtyInvoices(
    optionTime: number,
    dateFrom?: Date | null,
    dateTo?: Date | null
  ): Observable<VolChartsOrders[]> {
    this.isLoadingCharts.set(true);

    let url = `Invoice/GetQtyInvoices?OptionTime=${optionTime}`;

    if (dateFrom && dateTo && optionTime === 5) {
      url += `&dateFrom=${this.formatDateISO(dateFrom)}&dateTo=${this.formatDateISO(dateTo)}`;
    }

    return this.dataService.get$<VolChartsOrders[]>(url).pipe(
      tap({
        next: (data) => {
          this.chartOrdersData.set(data);
          this.isLoadingCharts.set(false);
        },
        error: () => {
          this.isLoadingCharts.set(false);
        }
      })
    );
  }
}
