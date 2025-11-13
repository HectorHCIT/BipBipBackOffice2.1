import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { DataService } from '@core/services/data.service';
import { ImageUploadService } from '@shared/services/image-upload.service';
import {
  DynamicLinkProduct,
  DynamicLinkProductResponse,
  CreateUpdateAppLinkRequest,
  ProductData,
  PaginationMetadata,
  AppLinkFilters,
} from '../models';

/**
 * App Link Service
 * Manages dynamic links (deep links) to products in the mobile app
 *
 * Uses:
 * - Signals for state management
 * - DataService for HTTP operations
 * - ImageUploadService for image uploads to S3
 */
@Injectable({
  providedIn: 'root',
})
export class AppLinkService {
  private readonly dataService = inject(DataService);
  private readonly imageUploadService = inject(ImageUploadService);

  // State signals
  private readonly _appLinks = signal<DynamicLinkProduct[]>([]);
  private readonly _pagination = signal<PaginationMetadata>({
    totalActive: 0,
    totalInactive: 0,
    page: 1,
    perPage: 10,
    pageCount: 0,
    totalCount: 0,
  });
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly signals
  readonly appLinks = this._appLinks.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Load app links with filters
   */
  loadAppLinks(filters: AppLinkFilters): void {
    this._isLoading.set(true);
    this._error.set(null);

    const params: any = {
      pageNumber: filters.page,
      pageSize: filters.pageSize,
    };

    if (filters.status !== null && filters.status !== undefined) {
      params.status = filters.status;
    }

    if (filters.search) {
      params.filter = filters.search;
    }

    this.dataService
      .get$<DynamicLinkProductResponse>('DynamicLinks/DynamicLinks', params)
      .pipe(
        tap((response) => {
          this._appLinks.set(response.data);
          this._pagination.set(response.metadata);
          this._isLoading.set(false);
        }),
        catchError((error) => {
          this._error.set('Error al cargar los app links');
          this._isLoading.set(false);
          console.error('Error loading app links:', error);
          return of({ data: [], metadata: this._pagination() });
        })
      )
      .subscribe();
  }

  /**
   * Get app link by ID for editing
   */
  getAppLinkById(id: number): Observable<DynamicLinkProduct> {
    return this.dataService
      .get$<DynamicLinkProduct>(`DynamicLinks/${id}/token`)
      .pipe(
        catchError((error) => {
          console.error(`Error loading app link ${id}:`, error);
          throw error;
        })
      );
  }

  /**
   * Create new app link
   */
  createAppLink(
    data: CreateUpdateAppLinkRequest
  ): Observable<DynamicLinkProduct> {
    this._isLoading.set(true);

    return this.dataService
      .post$<DynamicLinkProduct>('DynamicLinks/CreateDynamicLink', data)
      .pipe(
        tap((newAppLink) => {
          // Add to local state
          this._appLinks.update((links) => [...links, newAppLink]);
          this._isLoading.set(false);
        }),
        catchError((error) => {
          this._isLoading.set(false);
          console.error('Error creating app link:', error);
          throw error;
        })
      );
  }

  /**
   * Update existing app link
   */
  updateAppLink(
    id: number,
    data: CreateUpdateAppLinkRequest
  ): Observable<DynamicLinkProduct> {
    this._isLoading.set(true);

    return this.dataService
      .put$<DynamicLinkProduct>(
        `DynamicLinks/UpdateDynamicLink?IdDynLinkProd=${id}`,
        data
      )
      .pipe(
        tap((updatedAppLink) => {
          // Update local state
          this._appLinks.update((links) =>
            links.map((link) =>
              link.dynamicLinkXProductId === id ? updatedAppLink : link
            )
          );
          this._isLoading.set(false);
        }),
        catchError((error) => {
          this._isLoading.set(false);
          console.error(`Error updating app link ${id}:`, error);
          throw error;
        })
      );
  }

  /**
   * Change app link status (active/inactive)
   */
  changeStatus(id: number, status: boolean): Observable<void> {
    // Optimistic update
    this._appLinks.update((links) =>
      links.map((link) =>
        link.dynamicLinkXProductId === id ? { ...link, isActive: status } : link
      )
    );

    return this.dataService
      .put$<void>(`DynamicLinks/status?id=${id}&status=${status}`, {})
      .pipe(
        catchError((error) => {
          // Rollback on error
          this._appLinks.update((links) =>
            links.map((link) =>
              link.dynamicLinkXProductId === id
                ? { ...link, isActive: !status }
                : link
            )
          );
          console.error(`Error changing status for app link ${id}:`, error);
          throw error;
        })
      );
  }

  /**
   * Get products by brand ID
   * Maps productId to productCode for form compatibility
   */
  getProductsByBrand(brandId: number): Observable<ProductData[]> {
    return this.dataService
      .get$<ProductData[]>('Incentives/products', { brandId })
      .pipe(
        map((products) =>
          products.map((product) => ({
            ...product,
            productCode: product.productId, // Backend uses productId as the code
          }))
        ),
        catchError((error) => {
          console.error(`Error loading products for brand ${brandId}:`, error);
          return of([]);
        })
      );
  }

  /**
   * Upload image for app link
   * Uses ImageUploadService from shared
   */
  uploadImage(name: string, file: File): Observable<string> {
    return this.imageUploadService.createStorageForImage(name, file, {
      folder: 'app-links',
      optimize: true,
      maxWidth: 1200,
      maxHeight: 800,
      quality: 0.8,
      format: 'webp',
      maxSizeKB: 500,
    });
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this._error.set(null);
  }
}
