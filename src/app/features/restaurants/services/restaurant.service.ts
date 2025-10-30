import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DataService } from '@core/services/data.service';
import type {
  Restaurant,
  RestaurantListResponse,
  StatusFilter,
  RestaurantFilters,
  Country,
  City,
  RestaurantDetails,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  Brand
} from '../models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private readonly dataService = inject(DataService);

  // Signals for state management
  readonly restaurants = signal<Restaurant[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly isLoading = signal<boolean>(false);
  readonly statusFilters = signal<StatusFilter[]>([
    { idStatus: -1, label: 'Todos', filter: null, qty: 0 },
    { idStatus: 1, label: 'Activos', filter: 'true', qty: 0 },
    { idStatus: 0, label: 'Inactivos', filter: 'false', qty: 0 }
  ]);

  // Reference data
  readonly countries = signal<Country[]>([]);
  readonly cities = signal<City[]>([]);
  readonly brands = signal<Brand[]>([]);

  // Restaurant detail
  readonly restaurantDetail = signal<RestaurantDetails | null>(null);
  readonly isLoadingDetail = signal<boolean>(false);

  /**
   * Get restaurants list with pagination and filters
   */
  getRestaurants(filters: RestaurantFilters): Observable<RestaurantListResponse> {
    this.isLoading.set(true);

    // Build query params
    const params: string[] = [];
    params.push(`page=${filters.page + 1}`); // API uses 1-based pagination
    params.push(`pageSize=${filters.pageSize}`);

    if (filters.statusActive !== undefined) {
      params.push(`statusActive=${filters.statusActive}`);
    }

    if (filters.statusInactive !== undefined) {
      params.push(`statusInactive=${filters.statusInactive}`);
    }

    if (filters.countries && filters.countries.length > 0) {
      filters.countries.forEach(countryId => {
        params.push(`countries=${countryId}`);
      });
    }

    if (filters.cities && filters.cities.length > 0) {
      filters.cities.forEach(cityId => {
        params.push(`cities=${cityId}`);
      });
    }

    if (filters.search && filters.search.trim()) {
      params.push(`search=${encodeURIComponent(filters.search.trim())}`);
    }

    const url = `Restaurant/RestaurantsList?${params.join('&')}`;

    return this.dataService.get$<RestaurantListResponse>(url).pipe(
      tap({
        next: (response) => {
          this.restaurants.set(response.records);
          this.totalRecords.set(response.metadata.totalCount);
          this.currentPage.set(filters.page);

          // Update status filter counters
          this.updateStatusFilterCounters(response.metadata);

          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }

  /**
   * Update status filter counters from metadata
   */
  private updateStatusFilterCounters(metadata: any): void {
    const filters = this.statusFilters();
    const updatedFilters = filters.map(filter => {
      if (filter.idStatus === -1) {
        return { ...filter, qty: metadata.totalCount };
      } else if (filter.idStatus === 1) {
        return { ...filter, qty: metadata.totalActive };
      } else {
        return { ...filter, qty: metadata.totalInactive };
      }
    });
    this.statusFilters.set(updatedFilters);
  }

  /**
   * Get list of countries
   */
  getCountries(): Observable<Country[]> {
    return this.dataService.get$<Country[]>('Location/CountryList').pipe(
      tap(countries => {
        this.countries.set(countries);
      })
    );
  }

  /**
   * Get list of all cities (lighter endpoint)
   */
  getCitiesList(): Observable<City[]> {
    return this.dataService.get$<City[]>('Location/CityList').pipe(
      tap(cities => {
        this.cities.set(cities);
      })
    );
  }

  /**
   * Reset filters to default state
   */
  resetFilters(): void {
    this.currentPage.set(0);
  }

  /**
   * Get restaurant detail by ID
   */
  getRestaurantDetail(id: number): Observable<RestaurantDetails> {
    this.isLoadingDetail.set(true);
    return this.dataService.get$<RestaurantDetails>(`Restaurant/RestaurantDetail?restId=${id}`).pipe(
      tap({
        next: (detail) => {
          this.restaurantDetail.set(detail);
          this.isLoadingDetail.set(false);
        },
        error: () => {
          this.isLoadingDetail.set(false);
        }
      })
    );
  }

  /**
   * Create a new restaurant
   */
  createRestaurant(data: CreateRestaurantRequest): Observable<any> {
    return this.dataService.post$('Restaurant/CreateRestaurant', data);
  }

  /**
   * Update an existing restaurant
   */
  updateRestaurant(id: number, data: UpdateRestaurantRequest): Observable<any> {
    return this.dataService.put$(`Restaurant/UpdateRestaurant`, { ...data, restId: id });
  }

  /**
   * Get list of brands
   */
  getBrands(): Observable<Brand[]> {
    return this.dataService.get$<Brand[]>('Brand/BrandList').pipe(
      tap(brands => {
        this.brands.set(brands);
      })
    );
  }
}
