import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { DataService } from '../../../../core/services/data.service';
import {
  RegisteredUserRecord,
  RegisteredUsersMetadata,
  RegisteredUsersResponse,
  RegisteredUsersFilters,
  Country,
  City
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class RegisteredUsersService {
  private readonly dataService = inject(DataService);

  readonly users = signal<RegisteredUserRecord[]>([]);
  readonly metadata = signal<RegisteredUsersMetadata>({
    page: 1,
    perPage: 10,
    pageCount: 0,
    totalActive: 0,
    totalInactive: 0,
    totalLockedPenalty: 0,
    totalCount: 0
  });
  readonly isLoading = signal(false);

  /**
   * Get registered users list with filters
   */
  getRegisteredUsers(filters: Partial<RegisteredUsersFilters>): Observable<RegisteredUsersResponse> {
    this.isLoading.set(true);

    const params: Record<string, any> = {
      pageNumber: filters.pageNumber ?? 1,
      pageSize: filters.pageSize ?? 10
    };

    // Add status filter
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'blocked') {
        params['status'] = 'blocked';
      } else if (filters.status === 'active') {
        params['status'] = 'active';
      } else if (filters.status === 'inactive') {
        params['status'] = 'inactive';
      }
    }

    // Add search filter
    if (filters.filter) {
      params['filter'] = filters.filter;
    }

    // Add date filters
    if (filters.from) {
      params['from'] = filters.from;
    }
    if (filters.to) {
      params['to'] = filters.to;
    }

    // Add location filters
    if (filters.countries && filters.countries.length > 0) {
      params['countries'] = filters.countries;
    }
    if (filters.cities && filters.cities.length > 0) {
      params['cities'] = filters.cities;
    }

    return this.dataService.get$<RegisteredUsersResponse>('Customer/CustomersRegisteredList', params).pipe(
      tap(response => {
        this.users.set(response.data);
        this.metadata.set(response.metadata);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Get list of countries
   */
  getCountries(): Observable<Country[]> {
    return this.dataService.get$<Country[]>('Location/CountryList');
  }

  /**
   * Get cities by country
   */
  getCitiesByCountry(countryId: number): Observable<City[]> {
    return this.dataService.get$<City[]>('Location/CityCountry', { idCountry: countryId });
  }
}
