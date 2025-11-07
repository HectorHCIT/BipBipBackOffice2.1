import { Injectable, inject, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { DataService } from '../../../../core/services/data.service';
import {
  RegisteredUserRecord,
  RegisteredUsersMetadata,
  RegisteredUsersResponse,
  RegisteredUsersFilters,
  Country,
  City,
  CustomerProfile,
  CustomerOrdersResponse,
  CustomerLoyalty,
  BipTransactionsResponse,
  IncidentsResponse,
  GrantBipsForm,
  AvailableBenefit,
  SpecialPermission,
  CreateSpecialPermissionForm,
  Brand,
  Store
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

  /**
   * Observable for tab refresh communication
   */
  private readonly refreshSubject = new Subject<void>();
  readonly refresh$ = this.refreshSubject.asObservable();

  triggerRefresh(): void {
    this.refreshSubject.next();
  }

  // ============================================
  // USER DETAILS - TAB 1: GENERAL
  // ============================================

  /**
   * Get customer profile details
   */
  getCustomerProfile(customerId: number): Observable<CustomerProfile> {
    return this.dataService.get$<CustomerProfile>('Customer/Profile', { IdCustomer: customerId });
  }

  // ============================================
  // USER DETAILS - TAB 2: ORDERS
  // ============================================

  /**
   * Get customer orders
   */
  getCustomerOrders(customerId: number, pageNumber: number, pageSize: number): Observable<CustomerOrdersResponse> {
    return this.dataService.get$<CustomerOrdersResponse>('Customer/Orders', {
      customerId,
      pageNumber,
      pageSize
    });
  }

  // ============================================
  // USER DETAILS - TAB 3: LOYALTY
  // ============================================

  /**
   * Get customer loyalty information
   */
  getCustomerLoyalty(customerId: number): Observable<CustomerLoyalty> {
    return this.dataService.get$<CustomerLoyalty>('Customer/Loyalty', { customerId });
  }

  // ============================================
  // USER DETAILS - TAB 4: BIP LOGS
  // ============================================

  /**
   * Get bip transactions history
   */
  getBipTransactions(customerId: number, pageNumber: number, pageSize: number): Observable<BipTransactionsResponse> {
    return this.dataService.get$<BipTransactionsResponse>('Customer/Transactions', {
      customerId,
      pageNumber,
      pageSize
    });
  }

  // ============================================
  // USER DETAILS - TAB 5: INCIDENTS
  // ============================================

  /**
   * Get customer incidents
   */
  getCustomerIncidents(customerId: number, pageNumber: number, pageSize: number): Observable<IncidentsResponse> {
    return this.dataService.get$<IncidentsResponse>('Customer/Incidents', {
      customerId,
      pageNumber,
      pageSize
    });
  }

  // ============================================
  // USER DETAILS - TAB 6: GRANT BIPS
  // ============================================

  /**
   * Grant bips to customer
   */
  grantBips(customerId: number, action: string, data: GrantBipsForm): Observable<any> {
    return this.dataService.post$(`Customer/${customerId}/bips/send`, data, { action });
  }

  // ============================================
  // USER DETAILS - TAB 7: GRANT BENEFITS
  // ============================================

  /**
   * Get available benefits for customer
   */
  getAvailableBenefits(customerId: number): Observable<AvailableBenefit[]> {
    return this.dataService.get$<AvailableBenefit[]>('LoyaltyLevel/ListBenefits', { customerId });
  }

  /**
   * Grant benefit to customer
   */
  grantBenefit(customerId: number, itemId: number, quantity: number): Observable<any> {
    return this.dataService.post$('Customer/Loyalty/add', null, {
      codItemWallet: itemId,
      quantity,
      customerId
    });
  }

  // ============================================
  // USER DETAILS - TAB 8: SPECIAL PERMISSIONS
  // ============================================

  /**
   * Get all cities (for special permissions)
   */
  getAllCities(): Observable<City[]> {
    return this.dataService.get$<City[]>('Location/CityList');
  }

  /**
   * Get all brands
   */
  getBrands(): Observable<Brand[]> {
    return this.dataService.get$<Brand[]>('Brand/BrandsListSorted');
  }

  /**
   * Get stores by brand and city
   */
  getStores(brandId: number, cityId: number): Observable<Store[]> {
    return this.dataService.get$<Store[]>('Restaurant/shortNames', { brandId, cityId });
  }

  /**
   * Get special permissions for customer
   */
  getSpecialPermissions(customerId: number): Observable<SpecialPermission[]> {
    return this.dataService.get$<SpecialPermission[]>('Customer/SpecialCustomerOrder', { customerId });
  }

  /**
   * Create special permission
   */
  createSpecialPermission(data: CreateSpecialPermissionForm): Observable<any> {
    return this.dataService.post$('Customer/SpecialCustomerOrder', data);
  }

  /**
   * Delete special permission
   */
  deleteSpecialPermission(customerId: number, storeId: number): Observable<any> {
    return this.dataService.delete$('Customer/SpecialCustomerOrder', { customerId, storeId });
  }
}
