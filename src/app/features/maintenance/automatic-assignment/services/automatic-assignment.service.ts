import { Injectable, signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DataService } from '@core/services/data.service';
import { GlobalDataService } from '@core/services/global-data.service';
import {
  type AutomaticAssignment,
  type AssignmentByCity,
  type AutomaticAssignmentResponse,
  type AssignmentFilterParams,
  type AssignmentSearchParams
} from '../models';

/**
 * AutomaticAssignmentService
 *
 * Service for managing automatic assignment monitoring
 * Handles real-time assignment data retrieval with filtering and search
 */
@Injectable({
  providedIn: 'root'
})
export class AutomaticAssignmentService {
  private readonly dataService = inject(DataService);
  private readonly globalData = inject(GlobalDataService);

  // State signals
  readonly assignments = signal<AutomaticAssignment[]>([]);
  readonly assignmentsByCity = signal<AssignmentByCity[]>([]);
  readonly isLoading = signal(false);
  readonly totalRecords = signal(0);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalPages = signal(0);

  /**
   * Enrich assignments with country flags from GlobalDataService
   */
  private enrichWithFlags(assignments: AutomaticAssignment[]): AutomaticAssignment[] {
    const countries = this.globalData.countries();
    return assignments.map(assignment => {
      const country = countries.find(c => c.id === assignment.countryId);
      return {
        ...assignment,
        countryUrlFlag: country?.urlFlag || null
      };
    });
  }

  /**
   * Enrich city assignments with country flags from GlobalDataService
   */
  private enrichCityAssignmentsWithFlags(assignments: AssignmentByCity[]): AssignmentByCity[] {
    const countries = this.globalData.countries();
    return assignments.map(assignment => {
      const country = countries.find(c => c.id === assignment.countryId);
      return {
        ...assignment,
        countryUrlFlag: country?.urlFlag || null
      };
    });
  }

  /**
   * Get paginated list of automatic assignments
   */
  getAssignmentList(pageNumber: number, pageSize: number): Observable<AutomaticAssignmentResponse> {
    this.isLoading.set(true);

    const params = {
      pageNumber,
      pageSize
    };

    return this.dataService.get$<AutomaticAssignmentResponse>(
      'AutomaticAssignment/AutomaticAssignmentList',
      params
    ).pipe(
      tap(response => {
        const enrichedData = this.enrichWithFlags(response.data);
        this.assignments.set(enrichedData);
        this.totalRecords.set(response.metadata.totalCount);
        this.currentPage.set(response.metadata.page);
        this.pageSize.set(response.metadata.perPage);
        this.totalPages.set(response.metadata.pageCount);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Get assignments summary grouped by city
   */
  getAssignmentsByCity(): Observable<AssignmentByCity[]> {
    return this.dataService.get$<AssignmentByCity[]>(
      'AutomaticAssignment/AutomaticAssignmentByCity'
    ).pipe(
      tap(data => {
        const enrichedData = this.enrichCityAssignmentsWithFlags(data);
        this.assignmentsByCity.set(enrichedData);
      })
    );
  }

  /**
   * Get filtered assignments with multiple criteria
   */
  getAssignmentsByFilter(filterParams: AssignmentFilterParams): Observable<AutomaticAssignmentResponse> {
    this.isLoading.set(true);

    // Build query params - arrays need to be sent as multiple params with same key
    const params: Record<string, string | number> = {
      pageNumber: filterParams.pageNumber,
      pageSize: filterParams.pageSize
    };

    // Add date filters if present
    if (filterParams.dateFrom) {
      params['DateFrom'] = filterParams.dateFrom;
    }
    if (filterParams.dateTo) {
      params['DateTo'] = filterParams.dateTo;
    }

    // Build query string manually to handle arrays correctly
    let queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    // Add country array
    if (filterParams.countries && filterParams.countries.length > 0) {
      const countriesQuery = filterParams.countries
        .map(id => `Countries=${id}`)
        .join('&');
      queryString += `&${countriesQuery}`;
    }

    // Add city array
    if (filterParams.cities && filterParams.cities.length > 0) {
      const citiesQuery = filterParams.cities
        .map(id => `Cities=${id}`)
        .join('&');
      queryString += `&${citiesQuery}`;
    }

    return this.dataService.get$<AutomaticAssignmentResponse>(
      `AutomaticAssignment/AutomaticAssignmentByFilter?${queryString}`
    ).pipe(
      tap(response => {
        const enrichedData = this.enrichWithFlags(response.data);
        this.assignments.set(enrichedData);
        this.totalRecords.set(response.metadata.totalCount);
        this.currentPage.set(response.metadata.page);
        this.pageSize.set(response.metadata.perPage);
        this.totalPages.set(response.metadata.pageCount);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Search assignments by parameter (driver name or order number)
   */
  searchAssignments(searchParams: AssignmentSearchParams): Observable<AutomaticAssignmentResponse> {
    this.isLoading.set(true);

    const params = {
      Parameter: searchParams.parameter,
      pageNumber: searchParams.pageNumber,
      pageSize: searchParams.pageSize
    };

    return this.dataService.get$<AutomaticAssignmentResponse>(
      'AutomaticAssignment/AutomaticAssignmentByParameter',
      params
    ).pipe(
      tap(response => {
        const enrichedData = this.enrichWithFlags(response.data);
        this.assignments.set(enrichedData);
        this.totalRecords.set(response.metadata.totalCount);
        this.currentPage.set(response.metadata.page);
        this.pageSize.set(response.metadata.perPage);
        this.totalPages.set(response.metadata.pageCount);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.assignments.set([]);
    this.assignmentsByCity.set([]);
    this.totalRecords.set(0);
    this.currentPage.set(1);
    this.pageSize.set(10);
    this.totalPages.set(0);
    this.isLoading.set(false);
  }
}
