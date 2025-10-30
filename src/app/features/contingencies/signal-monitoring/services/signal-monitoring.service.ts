import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  CityList,
  IMonitoringSignalRRedis,
} from '../models/signal-monitoring.model';

/**
 * Servicio para Signal Monitoring (Redis/SignalR)
 *
 * Este servicio maneja la comunicación con la API de SignalR/Redis
 * para monitorear y gestionar órdenes atascadas en la cola.
 *
 * IMPORTANTE: Usa API key personalizada y bypass del TokenInterceptor
 */
@Injectable({
  providedIn: 'root',
})
export class SignalMonitoringService {
  private readonly http = inject(HttpClient);

  // Signals para estado global
  readonly isLoading = signal<boolean>(false);
  readonly cities = signal<CityList[]>([]);
  readonly orders = signal<IMonitoringSignalRRedis[]>([]);

  /**
   * Headers especiales para API de SignalR
   * Incluye API key y bypass del token interceptor
   */
  private getSignalRHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-Bipbip-Api-Key': environment.apiKeySignal,
      'X-Skip-Interceptor': 'true', // Bypass del TokenInterceptor
    });
  }

  /**
   * Obtener lista de ciudades
   */
  getCities(): Observable<CityList[]> {
    return this.http
      .get<CityList[]>(`${environment.apiURL}Location/CityList`)
      .pipe(tap((cities) => this.cities.set(cities)));
  }

  /**
   * Obtener órdenes de Redis/SignalR por ciudad
   */
  getOrdersByCity(cityId: number): Observable<IMonitoringSignalRRedis[]> {
    this.isLoading.set(true);

    return this.http
      .get<IMonitoringSignalRRedis[]>(
        `${environment.apiURLSignalR}HubNotification/Orders/SendToAll/${cityId}`,
        { headers: this.getSignalRHeaders() }
      )
      .pipe(
        tap((orders) => {
          this.orders.set(orders);
          this.isLoading.set(false);
        })
      );
  }

  /**
   * Eliminar una orden de Redis/SignalR
   */
  deleteOrder(
    cityId: number,
    orderId: number
  ): Observable<any> {
    return this.http.delete(
      `${environment.apiURLSignalR}HubNotification/Orders/Remove/${cityId},${orderId}`,
      { headers: this.getSignalRHeaders() }
    );
  }
}
