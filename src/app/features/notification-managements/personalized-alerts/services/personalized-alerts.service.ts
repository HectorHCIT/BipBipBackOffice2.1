import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { DataService } from '@core/services/data.service';
import {
  PersonalizedAlert,
  CreateUpdatePersonalizedAlertRequest,
} from '../models';

/**
 * Personalized Alerts Service
 * Manages personalized alert notifications with modern patterns
 *
 * Uses:
 * - Signals for state management
 * - DataService for HTTP operations
 * - Loading and error states
 */
@Injectable({
  providedIn: 'root',
})
export class PersonalizedAlertsService {
  private readonly dataService = inject(DataService);

  // State signals
  private readonly _alerts = signal<PersonalizedAlert[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly signals
  readonly alerts = this._alerts.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Load all personalized alerts
   */
  loadAlerts(): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.dataService
      .get$<PersonalizedAlert[]>('Alerts')
      .pipe(
        tap((alerts) => {
          this._alerts.set(alerts);
          this._isLoading.set(false);
        }),
        catchError((error) => {
          this._error.set('Error al cargar las alertas');
          this._isLoading.set(false);
          console.error('Error loading personalized alerts:', error);
          return of([]);
        })
      )
      .subscribe();
  }

  /**
   * Get alert by code
   */
  getAlertByCode(code: string): Observable<PersonalizedAlert> {
    return this.dataService.get$<PersonalizedAlert>(`Alerts/${code}`).pipe(
      catchError((error) => {
        console.error(`Error loading alert ${code}:`, error);
        throw error;
      })
    );
  }

  /**
   * Create new alert
   */
  createAlert(
    alert: CreateUpdatePersonalizedAlertRequest
  ): Observable<PersonalizedAlert> {
    this._isLoading.set(true);

    return this.dataService.post$<PersonalizedAlert>('Alerts', alert).pipe(
      tap((newAlert) => {
        // Add to local state
        this._alerts.update((alerts) => [...alerts, newAlert]);
        this._isLoading.set(false);
      }),
      catchError((error) => {
        this._isLoading.set(false);
        console.error('Error creating alert:', error);
        throw error;
      })
    );
  }

  /**
   * Update existing alert
   */
  updateAlert(
    code: string,
    alert: CreateUpdatePersonalizedAlertRequest
  ): Observable<PersonalizedAlert> {
    this._isLoading.set(true);

    return this.dataService
      .put$<PersonalizedAlert>(`Alerts/${code}`, alert)
      .pipe(
        tap((updatedAlert) => {
          // Update local state
          this._alerts.update((alerts) =>
            alerts.map((a) => (a.code === code ? updatedAlert : a))
          );
          this._isLoading.set(false);
        }),
        catchError((error) => {
          this._isLoading.set(false);
          console.error(`Error updating alert ${code}:`, error);
          throw error;
        })
      );
  }

  /**
   * Delete alert
   */
  deleteAlert(code: string): Observable<void> {
    this._isLoading.set(true);

    return this.dataService.delete$<void>(`Alerts/${code}`).pipe(
      tap(() => {
        // Remove from local state
        this._alerts.update((alerts) => alerts.filter((a) => a.code !== code));
        this._isLoading.set(false);
      }),
      catchError((error) => {
        this._isLoading.set(false);
        console.error(`Error deleting alert ${code}:`, error);
        throw error;
      })
    );
  }

  /**
   * Check if alert code already exists
   */
  alertCodeExists(code: string): boolean {
    return this._alerts().some(
      (alert) => alert.code.toLowerCase() === code.toLowerCase()
    );
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this._error.set(null);
  }
}
