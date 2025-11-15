# Building Services

Provides patterns for creating services with signals, API integration, and reactive state management. Ensures services follow consistent patterns for HTTP calls, signal updates, and component integration.

## Table of Contents

- [Service Structure](#service-structure)
- [Signal Patterns](#signal-patterns)
- [DataService Integration](#dataservice-integration)
- [API Response Patterns](#api-response-patterns)
- [Component Integration](#component-integration)
- [Error Handling](#error-handling)
- [Common Patterns](#common-patterns)
- [Checklist](#checklist)

## Service Structure

Every service follows this template:

```typescript
import { Injectable, signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { DataService } from '@core/services/data.service';
import { Company, CompanyDetail, CreateCompanyRequest } from '../models/company.model';

@Injectable({
  providedIn: 'root'  // Always singleton!
})
export class CompanyService {
  // 1. Inject dependencies
  private readonly dataService = inject(DataService);

  // 2. Public readonly signals (reactive state)
  readonly companies = signal<Company[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  // 3. Private state signals (if needed)
  private readonly _selectedCompany = signal<Company | null>(null);
  readonly selectedCompany = this._selectedCompany.asReadonly();

  // 4. API methods (return Observables, update signals in tap())
  getCompanies(page: number, pageSize: number): Observable<CompanyListResponse> {
    this.isLoading.set(true);

    return this.dataService.get$<CompanyListResponse>(
      `Company/List?page=${page}&size=${pageSize}`
    ).pipe(
      tap((response) => {
        this.companies.set(response.data);
        this.totalRecords.set(response.metadata.totalCount);
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.isLoading.set(false);
        throw error;
      })
    );
  }

  getCompanyById(id: number): Observable<CompanyDetail> {
    return this.dataService.get$<CompanyDetail>(`Company/${id}`);
  }

  createCompany(request: CreateCompanyRequest): Observable<Company> {
    return this.dataService.post$<Company>('Company', request).pipe(
      tap((newCompany) => {
        this.companies.update(current => [...current, newCompany]);
      })
    );
  }
}
```

## Signal Patterns

### Pattern 1: List with Pagination

```typescript
@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly dataService = inject(DataService);

  // Signals
  readonly companies = signal<Company[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  getCompanies(page: number, size: number, filters?: Filters): Observable<Response> {
    this.isLoading.set(true);

    let url = `Company/List?page=${page + 1}&size=${size}`;
    if (filters?.status) url += `&status=${filters.status}`;

    return this.dataService.get$<Response>(url).pipe(
      tap((response) => {
        this.companies.set(response.data);
        this.totalRecords.set(response.metadata.totalCount);
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }
}
```

### Pattern 2: Single Item Detail

```typescript
@Injectable({ providedIn: 'root' })
export class CompanyService {
  readonly selectedCompany = signal<CompanyDetail | null>(null);
  readonly isLoadingDetail = signal<boolean>(false);

  getCompanyById(id: number): Observable<CompanyDetail> {
    this.isLoadingDetail.set(true);

    return this.dataService.get$<CompanyDetail>(`Company/${id}`).pipe(
      tap((company) => {
        this.selectedCompany.set(company);
        this.isLoadingDetail.set(false);
      }),
      catchError((error) => {
        this.isLoadingDetail.set(false);
        return throwError(() => error);
      })
    );
  }

  clearSelection(): void {
    this.selectedCompany.set(null);
  }
}
```

### Pattern 3: Cached Dropdown Data

```typescript
@Injectable({ providedIn: 'root' })
export class BrandService {
  readonly brands = signal<Brand[]>([]);
  private _loaded = signal<boolean>(false);

  getBrands(): Observable<Brand[]> {
    if (this._loaded()) {
      return of(this.brands());
    }

    return this.dataService.get$<Brand[]>('Brand/List').pipe(
      tap((brands) => {
        this.brands.set(brands);
        this._loaded.set(true);
      })
    );
  }

  refreshBrands(): Observable<Brand[]> {
    this._loaded.set(false);
    return this.getBrands();
  }
}
```

## DataService Integration

The `DataService` is the HTTP wrapper used for ALL API calls.

```typescript
// Available methods (already exists in project):
dataService.get$<T>(url: string): Observable<T>
dataService.post$<T>(url: string, body: any): Observable<T>
dataService.put$<T>(url: string, body: any): Observable<T>
dataService.delete$<T>(url: string): Observable<T>

// ALWAYS inject DataService, NEVER HttpClient directly!
private readonly dataService = inject(DataService);
```

### URL Building

```typescript
// Simple params
getCompanies(page: number, size: number): Observable<Response> {
  const url = `Company/List?page=${page + 1}&size=${size}`;
  return this.dataService.get$<Response>(url);
}

// With optional filters
getCompanies(page: number, size: number, filters?: Filters): Observable<Response> {
  let url = `Company/List?page=${page + 1}&size=${size}`;
  if (filters?.status) url += `&status=${filters.status}`;
  if (filters?.search) url += `&search=${encodeURIComponent(filters.search)}`;
  return this.dataService.get$<Response>(url);
}

// Helper for complex params
private buildQueryParams(params: Record<string, any>): string {
  return Object.entries(params)
    .filter(([_, value]) => value != null && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
}
```

## API Response Patterns

### List with Pagination

```typescript
export interface CompanyListResponse {
  data: Company[];
  metadata: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
  };
}

getCompanies(page: number, size: number): Observable<CompanyListResponse> {
  return this.dataService.get$<CompanyListResponse>(
    `Company/List?page=${page + 1}&size=${size}`
  ).pipe(
    tap((response) => {
      this.companies.set(response.data);
      this.totalRecords.set(response.metadata.totalCount);
    })
  );
}
```

### Create/Update

```typescript
export interface CreateCompanyRequest {
  name: string;
  taxId: string;
  isActive: boolean;
}

createCompany(request: CreateCompanyRequest): Observable<Company> {
  return this.dataService.post$<Company>('Company', request).pipe(
    tap((newCompany) => {
      this.companies.update(current => [...current, newCompany]);
      this.totalRecords.update(count => count + 1);
    })
  );
}

updateCompany(id: number, request: UpdateCompanyRequest): Observable<Company> {
  return this.dataService.put$<Company>(`Company/${id}`, request).pipe(
    tap((updated) => {
      this.companies.update(current =>
        current.map(c => c.id === id ? updated : c)
      );
    })
  );
}
```

## Component Integration

### Pattern 1: Reference Service Signals

```typescript
@Component({
  selector: 'app-companies-list',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompaniesListComponent implements OnInit {
  private readonly companyService = inject(CompanyService);

  // Reference service signals directly
  readonly companies = this.companyService.companies;
  readonly totalRecords = this.companyService.totalRecords;
  readonly isLoading = this.companyService.isLoading;

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    // Service updates signals automatically
    this.companyService.getCompanies(0, 10).subscribe();
  }
}
```

### Pattern 2: Local Component State

```typescript
@Component({
  selector: 'app-company-form',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyFormComponent implements OnInit {
  private readonly companyService = inject(CompanyService);

  // Local state (not shared)
  readonly isLoading = signal<boolean>(false);
  readonly company = signal<CompanyDetail | null>(null);

  ngOnInit(): void {
    if (this.companyId()) {
      this.loadCompany();
    }
  }

  loadCompany(): void {
    this.isLoading.set(true);

    this.companyService.getCompanyById(this.companyId()!)
      .subscribe({
        next: (company) => {
          this.company.set(company);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
  }
}
```

## Error Handling

### Component-Level

```typescript
loadCompanies(): void {
  this.companyService.getCompanies(0, 10)
    .subscribe({
      next: () => {
        // Data in service signals
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar empresas'
        });
        console.error(error);
      }
    });
}
```

### Service-Level

```typescript
getCompanies(page: number, size: number): Observable<Response> {
  this.isLoading.set(true);

  return this.dataService.get$<Response>(url).pipe(
    tap((response) => {
      this.companies.set(response.data);
      this.isLoading.set(false);
    }),
    catchError((error) => {
      this.isLoading.set(false);
      console.error('Service error:', error);
      return throwError(() => error);
    })
  );
}
```

## Common Patterns

### Master-Detail

```typescript
@Injectable({ providedIn: 'root' })
export class RestaurantService {
  // Master (list)
  readonly restaurants = signal<Restaurant[]>([]);

  // Detail (selected with related data)
  readonly selectedRestaurant = signal<RestaurantDetail | null>(null);
  readonly coverageZones = signal<CoverageZone[]>([]);

  selectRestaurant(id: number): Observable<void> {
    return forkJoin({
      restaurant: this.dataService.get$<RestaurantDetail>(`Restaurant/${id}`),
      zones: this.dataService.get$<CoverageZone[]>(`Restaurant/${id}/Zones`)
    }).pipe(
      tap(({ restaurant, zones }) => {
        this.selectedRestaurant.set(restaurant);
        this.coverageZones.set(zones);
      }),
      map(() => void 0)
    );
  }
}
```

### Dropdown Data Service

```typescript
@Injectable({ providedIn: 'root' })
export class DropdownDataService {
  readonly brands = signal<Brand[]>([]);
  readonly cities = signal<City[]>([]);
  private _loaded = signal<boolean>(false);

  loadAllDropdownData(): Observable<void> {
    if (this._loaded()) return of(void 0);

    return forkJoin({
      brands: this.dataService.get$<Brand[]>('Brand/List'),
      cities: this.dataService.get$<City[]>('City/List')
    }).pipe(
      tap(({ brands, cities }) => {
        this.brands.set(brands);
        this.cities.set(cities);
        this._loaded.set(true);
      }),
      map(() => void 0)
    );
  }
}
```

## Checklist

- [ ] Service uses `@Injectable({ providedIn: 'root' })`
- [ ] Dependencies injected with `inject()`
- [ ] DataService used for all HTTP (not HttpClient)
- [ ] All state managed with signals
- [ ] Signals are public readonly
- [ ] API methods return Observables
- [ ] Signals updated in `tap()` operator
- [ ] Error handling with `catchError()`
- [ ] Loading states tracked
- [ ] URL building is clean
- [ ] Request/response models typed
- [ ] Components reference service signals

---

**Services manage data, Signals provide reactivity, Components consume both!**
