import { Injectable, signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DataService } from '@core/services/data.service';
import { type Config, type ConfigUpdate } from '../models';

/**
 * AppConfigService
 *
 * Service for managing application-wide configurations
 * Handles fetching and updating critical app settings
 */
@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private readonly dataService = inject(DataService);

  // State signals
  readonly config = signal<Config | null>(null);
  readonly isLoading = signal(false);

  /**
   * Get current app configurations
   */
  getConfigurations(): Observable<Config> {
    this.isLoading.set(true);

    return this.dataService.get$<Config>('Configurations/customer').pipe(
      tap(config => {
        this.config.set(config);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Update app configurations (PATCH - only changed fields)
   */
  updateConfigurations(changes: ConfigUpdate): Observable<void> {
    this.isLoading.set(true);

    return this.dataService.patch$<void>('Configurations/customer', changes).pipe(
      tap(() => {
        // Reload configurations after update
        this.getConfigurations().subscribe();
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.config.set(null);
    this.isLoading.set(false);
  }
}
