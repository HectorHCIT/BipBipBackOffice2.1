import { Injectable, signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '@core/services/data.service';
import {
  TargetAudience,
  GeneralTargetObjective,
  EstimatedScopeResponse,
  CountryList,
  TargetAudienceDetail,
  PaginatedResponse,
  TargetAudienceFilters
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class TargetAudienceService {
  private readonly dataService = inject(DataService);

  // State
  private readonly _targetAudiences = signal<TargetAudience[]>([]);
  private readonly _countries = signal<CountryList[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _totalRecords = signal(0);

  // Readonly signals
  readonly targetAudiences = this._targetAudiences.asReadonly();
  readonly countries = this._countries.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly totalRecords = this._totalRecords.asReadonly();

  /**
   * Load target audiences with filters and pagination
   */
  loadTargetAudiences(filters: TargetAudienceFilters): void {
    this._isLoading.set(true);

    const params: Record<string, string | number> = {
      pageNumber: filters.page,
      pageSize: filters.pageSize
    };

    if (filters.search) {
      params['search'] = filters.search;
    }

    if (filters.isActive !== undefined) {
      params['isActive'] = filters.isActive.toString();
    }

    this.dataService
      .get$<PaginatedResponse<TargetAudience>>('TargetPublic/TargetAudienceList', params)
      .subscribe({
        next: (response) => {
          this._targetAudiences.set(response.data);
          this._totalRecords.set(response.metadata.totalCount);
          this._isLoading.set(false);
        },
        error: (error: unknown) => {
          console.error('Error loading target audiences:', error);
          this._targetAudiences.set([]);
          this._totalRecords.set(0);
          this._isLoading.set(false);
        }
      });
  }

  /**
   * Load countries with cities from Location/CityByCountry
   */
  loadCountries(): void {
    this.dataService
      .get$<CountryList[]>('Location/CityByCountry')
      .subscribe({
        next: (countries) => {
          this._countries.set(countries);
        },
        error: (error: unknown) => {
          console.error('Error loading countries:', error);
          this._countries.set([]);
        }
      });
  }

  /**
   * Get target audience detail by ID
   */
  getTargetAudienceById(id: number): Observable<TargetAudienceDetail> {
    return this.dataService.get$<TargetAudienceDetail>(
      'TargetPublic/TargetAudienceById',
      { IdAudiencia: id }
    );
  }

  /**
   * Create a new target audience
   */
  createTargetAudience(dto: GeneralTargetObjective): Observable<any> {
    return this.dataService.post$('TargetPublic/CreateTargetPublic', dto);
  }

  /**
   * Update an existing target audience
   */
  updateTargetAudience(id: number, status: boolean, dto: GeneralTargetObjective): Observable<any> {
    return this.dataService.put$(
      `TargetPublic/UpdateTargetPublic?id=${id}&status=${status}`,
      dto
    );
  }

  /**
   * Calculate estimated scope based on filters
   * Used in form for real-time scope calculation
   */
  calculateEstimatedScope(dto: GeneralTargetObjective): Observable<EstimatedScopeResponse> {
    return this.dataService.post$<EstimatedScopeResponse>(
      'TargetPublic/estimatedScope',
      dto
    );
  }
}
