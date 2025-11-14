import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  CustomerDashboardData,
  CustomerByCity,
  ApiResponse,
  CustomerPurchasesByCityDto,
  TotalRegisteredCustomersDto
} from '../models';

/**
 * CustomersDashboardService
 *
 * Servicio para obtener datos del dashboard de clientes.
 * Gestiona las peticiones a la API de customers y transforma las respuestas.
 */
@Injectable({
  providedIn: 'root'
})
export class CustomersDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiURLDash}customers`;

  /**
   * Obtiene el total de clientes registrados (último año)
   */
  getTotalRegistered(): Observable<number> {
    return this.http
      .get<ApiResponse<TotalRegisteredCustomersDto>>(`${this.baseUrl}/total-registered`)
      .pipe(
        map(response => response.data?.totalCustomers ?? 0),
        catchError(error => {
          console.error('Error getting total registered customers:', error);
          return of(0);
        })
      );
  }

  /**
   * Obtiene clientes por ciudad
   * Nota: La API devuelve solo clientes con compras (Top 20)
   */
  public getCustomersByCity(): Observable<CustomerByCity[]> {
    return this.http
      .get<ApiResponse<CustomerPurchasesByCityDto[]>>(`${this.baseUrl}/purchases/by-city`)
      .pipe(
        map(response => {
          const data = response.data ?? [];
          return data.map(item => ({
            cityName: item.cityName ?? 'Sin ciudad',
            totalClientes: item.quantity
          }));
        }),
        catchError(error => {
          console.error('Error getting customers by city:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene todos los datos del dashboard
   *
   * NOTA: Los endpoints actuales de la API no soportan filtros por fecha (hoy/ayer).
   * Por ahora, devolvemos el total disponible y valores simulados para hoy/ayer.
   *
   * TODO: Cuando el backend implemente endpoints con filtros de fecha, actualizar este método.
   */
  getDashboardData(): Observable<CustomerDashboardData> {
    return forkJoin({
      totalCount: this.getTotalRegistered(),
      citiesTotal: this.getCustomersByCity()
    }).pipe(
      map(results => {
        // TEMPORAL: Simulamos datos de hoy y ayer basándonos en el total
        // Estos valores deberían venir de endpoints específicos cuando estén disponibles
        const todayCount = 45; // Placeholder
        const yesterdayCount = 254; // Placeholder

        return {
          todayCount,
          yesterdayCount,
          totalCount: results.totalCount,
          citiesTotal: results.citiesTotal,
          // TEMPORAL: Usando los mismos datos de ciudad para todas las vistas
          // Idealmente estos vendrían de endpoints filtrados por fecha
          citiesToday: this.mockCitiesToday(),
          citiesYesterday: this.mockCitiesYesterday()
        };
      }),
      catchError(error => {
        console.error('Error loading customer dashboard data:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * TEMPORAL: Datos mock para "Hoy"
   * Reemplazar cuando exista endpoint /customers/by-city?date=today
   */
  private mockCitiesToday(): CustomerByCity[] {
    return [
      { cityName: 'Tegucigalpa', totalClientes: 18 },
      { cityName: 'San Pedro Sula', totalClientes: 16 },
      { cityName: 'La Ceiba', totalClientes: 4 },
      { cityName: 'Progreso', totalClientes: 4 },
      { cityName: 'Puerto Cortes', totalClientes: 1 },
      { cityName: 'Choloma', totalClientes: 1 }
    ];
  }

  /**
   * TEMPORAL: Datos mock para "Ayer"
   * Reemplazar cuando exista endpoint /customers/by-city?date=yesterday
   */
  private mockCitiesYesterday(): CustomerByCity[] {
    return [
      { cityName: 'Tegucigalpa', totalClientes: 94 },
      { cityName: 'San Pedro Sula', totalClientes: 66 },
      { cityName: 'La Ceiba', totalClientes: 15 },
      { cityName: 'Choloma', totalClientes: 11 },
      { cityName: 'Progreso', totalClientes: 11 },
      { cityName: 'Puerto Cortes', totalClientes: 9 },
      { cityName: 'Tela', totalClientes: 7 },
      { cityName: 'Comayagua', totalClientes: 6 }
    ];
  }

  /**
   * Obtiene registros por semana del mes actual
   */
  getRegistrationsByWeekThisMonth(): Observable<any[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.baseUrl}/total-registered/this-month`)
      .pipe(
        map(response => response.data ?? []),
        catchError(error => {
          console.error('Error getting registrations by week (this month):', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene registros por semana del mes anterior
   */
  getRegistrationsByWeekLastMonth(): Observable<any[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.baseUrl}/total-registered/last-month`)
      .pipe(
        map(response => response.data ?? []),
        catchError(error => {
          console.error('Error getting registrations by week (last month):', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene registros por mes del último año
   */
  getRegistrationsByMonthLastYear(): Observable<any[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.baseUrl}/total-registered/last-year`)
      .pipe(
        map(response => response.data ?? []),
        catchError(error => {
          console.error('Error getting registrations by month (last year):', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene edad promedio de clientes
   */
  getAverageAge(): Observable<number> {
    return this.http
      .get<ApiResponse<{ agePromedio: number }>>(`${this.baseUrl}/average-age`)
      .pipe(
        map(response => response.data?.agePromedio ?? 0),
        catchError(error => {
          console.error('Error getting average age:', error);
          return of(0);
        })
      );
  }

  /**
   * Obtiene total de clientes penalizados
   */
  getTotalPenalized(): Observable<number> {
    return this.http
      .get<ApiResponse<{ totalClientesLocks: number }>>(`${this.baseUrl}/total-penalized`)
      .pipe(
        map(response => response.data?.totalClientesLocks ?? 0),
        catchError(error => {
          console.error('Error getting penalized customers:', error);
          return of(0);
        })
      );
  }

  /**
   * Obtiene total de clientes con compras
   */
  getCustomersWithPurchases(): Observable<number> {
    return this.http
      .get<ApiResponse<{ totalQuantity: number }>>(`${this.baseUrl}/purchases/summary-by-city`)
      .pipe(
        map(response => response.data?.totalQuantity ?? 0),
        catchError(error => {
          console.error('Error getting customers with purchases:', error);
          return of(0);
        })
      );
  }

  /**
   * Obtiene total de clientes sin compras
   */
  getCustomersWithoutPurchases(): Observable<number> {
    return this.http
      .get<ApiResponse<{ totalCantidad: number }>>(`${this.baseUrl}/purchases-without/summary-by-city`)
      .pipe(
        map(response => response.data?.totalCantidad ?? 0),
        catchError(error => {
          console.error('Error getting customers without purchases:', error);
          return of(0);
        })
      );
  }


}
