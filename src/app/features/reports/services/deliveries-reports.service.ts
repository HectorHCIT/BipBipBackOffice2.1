import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GlobalDataService } from '@core/services/global-data.service';
import { DataService } from '@core/services/data.service';
import {
  CityList,
  DriverByCityList,
  RESTByCityList,
  BrandList,
  RestByBrand,
  BaseList
} from '../models/report.types';
import { ReportBaseService } from './report-base.service';

/**
 * DeliveriesReportsService
 *
 * Servicio centralizado para todos los reportes de deliveries.
 * Proporciona:
 * - Endpoints para obtener datos de referencia (cities, drivers, restaurants, brands, bases)
 * - Endpoints para generar cada uno de los 10 reportes
 * - Gestión de estado de carga con signals (heredado de ReportBaseService)
 *
 * Endpoints de referencia:
 * - getCityList() - Lista de ciudades (desde GlobalDataService)
 * - getDriverByCityList(cityId) - Drivers por ciudad
 * - getUnlinkedRestaurants(cityCode) - Restaurantes por ciudad
 * - getBrandList() - Lista de marcas (desde GlobalDataService)
 * - getRestByBrand(brandId) - Restaurantes por marca
 * - getBaseSumary(cityId) - Bases de operación por ciudad
 *
 * Endpoints de reportes:
 * 1. getReportDeliveryInactive() - Deliveries inactivos
 * 2. getReportActiveDrivers() - Drivers activos
 * 3. getReportActiveDriversComanda() - Drivers activos por comanda
 * 4. getReportDriverParDelivery() - Días de entrega por driver
 * 5. getReportIncidencias() - Incidencias por driver
 * 6. getReportParTimes() - Tiempos de entrega por restaurante
 * 7. getReportDeliveryDriver() - Cantidad de entregas por driver
 * 8. getReportActivations() - Activaciones de drivers
 * 9. (BipPay - pendiente de implementación)
 * 10. getReportBaseDrivers() - Drivers por base
 */
@Injectable({
  providedIn: 'root'
})
export class DeliveriesReportsService extends ReportBaseService {
  private readonly globalData = inject(GlobalDataService);
  private readonly dataService = inject(DataService);

  // ============================================================================
  // MÉTODOS DE DATOS DE REFERENCIA
  // ============================================================================

  /**
   * Obtiene lista de ciudades desde GlobalDataService
   * Retorna las ciudades completas con toda la información
   */
  getCityList(): Observable<CityList[]> {
    // Usar el endpoint directo en lugar del signal para obtener data fresca
    return this.dataService.get$<CityList[]>('Location/CityList');
  }

  /**
   * Obtiene lista de drivers por ciudad
   * @param cityId - ID de la ciudad
   */
  getDriverByCityList(cityId: number): Observable<DriverByCityList[]> {
    return this.http.get<DriverByCityList[]>(
      `${environment.apiURL}Driver/DriverByCity/summary?cityId=${cityId}`
    );
  }

  /**
   * Obtiene lista de restaurantes no vinculados por ID de ciudad
   * @param cityId - ID de la ciudad (numérico)
   */
  getUnlinkedRestaurants(cityId: number): Observable<RESTByCityList[]> {
    return this.http.get<RESTByCityList[]>(
      `${environment.apiURL}Restaurant/UnlinkedRestaurants?cityCode=${cityId}`
    );
  }

  /**
   * Obtiene lista de marcas desde GlobalDataService
   */
  getBrandList(): Observable<BrandList[]> {
    return this.dataService.get$<BrandList[]>('Brand/BrandsListSorted');
  }

  /**
   * Obtiene lista de restaurantes por marca
   * @param brandId - ID de la marca
   */
  getRestByBrand(brandId: number): Observable<RestByBrand[]> {
    return this.http.get<RestByBrand[]>(
      `${environment.apiURL}Restaurant/shortNames?brandId=${brandId}`
    );
  }

  /**
   * Obtiene resumen de bases de operación por ciudad
   * @param cityId - ID de la ciudad
   */
  getBaseSumary(cityId: number): Observable<BaseList[]> {
    return this.http.get<BaseList[]>(
      `${environment.apiURL}Headquarter/summary?cityId=${cityId}`
    );
  }

  // ============================================================================
  // REPORTES
  // ============================================================================

  /**
   * Reporte 1: Deliveries Inactivos
   * @param startDate - Fecha inicial (DD-MM-YYYY)
   * @param endDate - Fecha final (DD-MM-YYYY)
   * @param cityId - ID de ciudad
   * @param format - 1=PDF, 2=Excel
   * @returns Observable con base64 del archivo
   */
  getReportDeliveryInactive(
    startDate: string,
    endDate: string,
    cityId: number,
    format: number
  ): Observable<string> {
    return this.http.get<string>(
      `${environment.apiURLReports}backoffice/reporteInactivosDeliveries/${startDate}/${endDate}/${cityId}/${format}`
    );
  }

  /**
   * Reporte 2: Drivers Activos
   * @param date - Fecha (DD-MM-YYYY)
   * @param cityId - ID de ciudad
   * @param format - 1=PDF, 2=Excel
   * @returns Observable con base64 del archivo
   */
  getReportActiveDrivers(
    date: string,
    cityId: number,
    format: number
  ): Observable<string> {
    return this.http.get<string>(
      `${environment.apiURLReports}backoffice/reporteActivosDrivers/${date}/${cityId}/${format}/false`
    );
  }

  /**
   * Reporte 3: Drivers Activos por Comanda
   * @param date - Fecha (DD-MM-YYYY)
   * @param cityId - ID de ciudad
   * @param format - 1=PDF, 2=Excel
   * @returns Observable con base64 del archivo
   */
  getReportActiveDriversComanda(
    date: string,
    cityId: number,
    format: number
  ): Observable<string> {
    return this.http.get<string>(
      `${environment.apiURLReports}backoffice/reporteActivosDriversComanda/${date}/${cityId}/${format}/false`
    );
  }

  /**
   * Reporte 4: Días de Entrega por Driver
   * @param startDate - Fecha inicial (DD-MM-YYYY)
   * @param endDate - Fecha final (DD-MM-YYYY)
   * @param cityId - ID de ciudad
   * @param format - 1=PDF, 2=Excel
   * @returns Observable con base64 del archivo
   */
  getReportDriverParDelivery(
    startDate: string,
    endDate: string,
    cityId: number,
    format: number
  ): Observable<string> {
    return this.http.get<string>(
      `${environment.apiURLReports}backoffice/reportedriversconentrega/${startDate}/${endDate}/${cityId}/${format}/false`
    );
  }

  /**
   * Reporte 5: Incidencias por Driver
   * @param startDate - Fecha inicial (DD-MM-YYYY)
   * @param endDate - Fecha final (DD-MM-YYYY)
   * @param driverId - ID del driver
   * @param format - 1=PDF, 2=Excel
   * @returns Observable con base64 del archivo
   */
  getReportIncidencias(
    startDate: string,
    endDate: string,
    driverId: number,
    format: number
  ): Observable<string> {
    return this.http.get<string>(
      `${environment.apiURLReports}backoffice/reporteIncidencias/${startDate}/${endDate}/${driverId}/${format}`
    );
  }

  /**
   * Reporte 6: Tiempos de Entrega por Restaurante
   * @param startDate - Fecha inicial (DD-MM-YYYY)
   * @param endDate - Fecha final (DD-MM-YYYY)
   * @param restId - ID del restaurante
   * @param format - 1=PDF, 2=Excel
   * @returns Observable con base64 del archivo
   */
  getReportParTimes(
    startDate: string,
    endDate: string,
    restId: number,
    format: number
  ): Observable<string> {
    if (format === 1) {
      // PDF
      return this.http.get<string>(
        `${environment.apiURLReports}backoffice/reportetiempos/${startDate}/${endDate}/${restId}`
      );
    } else {
      // Excel
      return this.http.get<string>(
        `${environment.apiURLReports}backoffice/reportetiemposexcel/${startDate}/${endDate}/${restId}`
      );
    }
  }

  /**
   * Reporte 7: Cantidad de Entregas por Driver
   * @param startDate - Fecha inicial (DD-MM-YYYY)
   * @param endDate - Fecha final (DD-MM-YYYY)
   * @param cityId - ID de ciudad
   * @param format - 1=PDF, 2=Excel
   * @returns Observable con base64 del archivo
   */
  getReportDeliveryDriver(
    startDate: string,
    endDate: string,
    cityId: number,
    format: number
  ): Observable<string> {
    return this.http.get<string>(
      `${environment.apiURLReports}backoffice/reportedriverscantidad/${startDate}/${endDate}/${cityId}/${format}`
    );
  }

  /**
   * Reporte 8: Activaciones de Drivers
   * @param startDate - Fecha inicial (YYYY-MM-DD)
   * @param endDate - Fecha final (YYYY-MM-DD)
   * @returns Observable con base64 del archivo Excel
   *
   * Nota: Este reporte solo genera Excel y usa formato de fecha ISO
   */
  getReportActivations(startDate: string, endDate: string): Observable<string> {
    return this.http.get<string>(
      `${environment.apiURL}Reports/Activaciones?fechaInicio=${startDate}&fechaFinal=${endDate}`
    );
  }

  /**
   * Reporte 10: Drivers por Base de Operación
   * @param baseId - ID de la base
   * @param baseName - Nombre de la base
   * @param format - 1=PDF, 2=Excel
   * @returns Observable con base64 del archivo
   */
  getReportBaseDrivers(
    baseId: number,
    baseName: string,
    format: number
  ): Observable<string> {
    if (format === 2) {
      // Excel
      return this.http.get<string>(
        `${environment.apiURL}Reports/BaseDriver?headquarterId=${baseId}`
      );
    } else {
      // PDF
      return this.http.get<string>(
        `${environment.apiURLReports}backoffice/reporteBase/true/${baseId}/${baseName}`
      );
    }
  }
}
