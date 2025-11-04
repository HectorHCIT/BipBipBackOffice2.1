import { Injectable, signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DataService } from '@core/services/data.service';
import {
  type Credential,
  type CreateCredentialRequest,
  type UpdateCredentialRequest,
  type CredentialFilterCriteria,
  type PaginatedCredentialsResponse,
  type ApiUsersListResponse,
  type ApiUserRecord,
  type ApiNewUserRequest,
  type ApiUpdateUserRequest
} from '../models';

/**
 * CredentialService
 *
 * Service for managing user credentials
 * Handles CRUD operations, pagination, filtering, and status management
 */
@Injectable({
  providedIn: 'root'
})
export class CredentialService {
  private readonly dataService = inject(DataService);

  // State signals
  readonly credentials = signal<Credential[]>([]);
  readonly isLoading = signal(false);
  readonly totalRecords = signal(0);
  readonly totalActive = signal(0);
  readonly totalInactive = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  readonly selectedCredential = signal<Credential | null>(null);

  /**
   * Get paginated credentials list with filters
   */
  getCredentials(criteria: CredentialFilterCriteria): Observable<PaginatedCredentialsResponse> {
    this.isLoading.set(true);

    // Build query params
    const params: Record<string, string | number> = {
      pageNumber: criteria.page + 1, // API is 1-indexed
      pageSize: criteria.pageSize
    };

    if (criteria.search) {
      params['filter'] = criteria.search;
    }

    if (criteria.userActive !== undefined) {
      params['status'] = criteria.userActive ? 'true' : 'false';
    }

    // Note: API doesn't support countryId, cityId, roleId, dateFrom, dateTo filters
    // These would need to be handled client-side or added to API

    return this.dataService.get$<ApiUsersListResponse>('Users', params).pipe(
      map(response => this.mapApiResponseToModel(response)),
      tap(response => {
        this.credentials.set(response.data);
        this.totalRecords.set(response.total);
        this.totalActive.set(response.metadata?.totalActive ?? 0);
        this.totalInactive.set(response.metadata?.totalInactive ?? 0);
        this.currentPage.set(criteria.page);
        this.pageSize.set(criteria.pageSize);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Get single credential by ID
   */
  getCredentialById(userId: number): Observable<Credential> {
    this.isLoading.set(true);

    return this.dataService.get$<ApiUserRecord>(`Users/${userId}`).pipe(
      map(record => this.mapApiRecordToCredential(record)),
      tap(credential => {
        this.selectedCredential.set(credential);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Create new credential
   */
  createCredential(request: CreateCredentialRequest): Observable<Credential> {
    this.isLoading.set(true);

    const apiRequest: ApiNewUserRequest = {
      userName: request.userName,
      email: request.userEmail,
      phoneNumber: request.userPhone,
      assignedCountry: '', // Will be populated from location data
      assignedCity: '', // Will be populated from location data
      isActive: true,
      roleId: request.roleId.toString(),
      role: '', // Will be populated from role data
      profileImage: request.userImageKey ?? null,
      password: request.userPassword,
      cityId: request.cityId,
      countryId: request.countryId
    };

    return this.dataService.post$<ApiUserRecord>('Users', apiRequest).pipe(
      map(record => this.mapApiRecordToCredential(record)),
      tap(credential => {
        // Add to local state
        this.credentials.update(list => [...list, credential]);
        this.totalRecords.update(count => count + 1);
        this.totalActive.update(count => count + 1);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Update existing credential
   */
  updateCredential(userId: number, request: UpdateCredentialRequest): Observable<Credential> {
    this.isLoading.set(true);

    const apiRequest: ApiUpdateUserRequest = {
      id: userId.toString(),
      userName: request.userName,
      email: request.userEmail,
      phoneNumber: request.userPhone,
      roleId: request.roleId.toString(),
      cityId: request.cityId,
      countryId: request.countryId
    };

    // Only include profileImage if provided
    if (request.userImageKey !== undefined && request.userImageKey !== null) {
      apiRequest.profileImage = request.userImageKey;
    }

    // Only include password if provided
    if (request.userPassword) {
      apiRequest.password = request.userPassword;
    }

    return this.dataService.patch$<ApiUserRecord>(`Users/${userId}`, apiRequest).pipe(
      map(record => this.mapApiRecordToCredential(record)),
      tap(credential => {
        // Update in local state
        this.credentials.update(list =>
          list.map(c => (c.userId === userId ? credential : c))
        );
        if (this.selectedCredential()?.userId === userId) {
          this.selectedCredential.set(credential);
        }
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Toggle credential active status
   */
  toggleCredentialStatus(userId: number, isActive: boolean): Observable<void> {
    this.isLoading.set(true);

    return this.dataService.put$<void>(`Users/${userId}/status?status=${isActive}`, {}).pipe(
      tap(() => {
        // Update in local state
        this.credentials.update(list =>
          list.map(c =>
            c.userId === userId ? { ...c, userActive: isActive } : c
          )
        );

        // Update counts
        if (isActive) {
          this.totalActive.update(count => count + 1);
          this.totalInactive.update(count => count - 1);
        } else {
          this.totalActive.update(count => count - 1);
          this.totalInactive.update(count => count + 1);
        }

        this.isLoading.set(false);
      })
    );
  }

  /**
   * Map API response to internal model
   */
  private mapApiResponseToModel(response: ApiUsersListResponse): PaginatedCredentialsResponse {
    return {
      data: response.records.map(record => this.mapApiRecordToCredential(record)),
      total: response.metadata.totalCount,
      page: response.metadata.page - 1, // Convert to 0-indexed
      pageSize: response.metadata.perPage,
      totalPages: response.metadata.pageCount,
      metadata: {
        totalActive: response.metadata.totalActive,
        totalInactive: response.metadata.totalInactive
      }
    };
  }

  /**
   * Map API record to Credential model
   */
  private mapApiRecordToCredential(record: ApiUserRecord): Credential {
    return {
      userId: parseInt(record.id, 10),
      userName: record.userName,
      userLastName: '', // API doesn't provide last name separately
      userFullName: record.userName,
      userEmail: record.email,
      userPhone: record.phoneNumber,
      userAddress: '', // API doesn't provide address in list
      userActive: record.isActive,
      userImage: record.profileImage,
      userImageKey: record.profileImage,
      roleId: record.roleId, // UUID string
      roleName: record.role,
      countryId: record.countryId,
      countryName: record.assignedCountry,
      cityId: record.cityId,
      cityName: record.assignedCity,
      createdAt: record.createdAt,
      updatedAt: record.createdAt // API doesn't provide updatedAt
    };
  }

  /**
   * Clear selected credential
   */
  clearSelection(): void {
    this.selectedCredential.set(null);
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.credentials.set([]);
    this.totalRecords.set(0);
    this.totalActive.set(0);
    this.totalInactive.set(0);
    this.currentPage.set(0);
    this.selectedCredential.set(null);
    this.isLoading.set(false);
  }
}
