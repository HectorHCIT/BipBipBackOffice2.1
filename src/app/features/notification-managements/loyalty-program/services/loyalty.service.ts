import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { DataService } from '@core/services/data.service';
import { ImageUploadService } from '@shared/services/image-upload.service';
import {
  LoyaltyLevel,
  CreateLoyaltyLevelRequest,
  UpdateLevelStatusRequest,
  Brand,
  Product,
  ModifierResponse,
  MinMaxPoints,
  BenefitCode,
  LevelIcon,
  LoyaltyBenefit
} from '../models';

/**
 * Loyalty Program Service
 * Manages loyalty levels, benefits, products, and modifiers
 */
@Injectable({
  providedIn: 'root',
})
export class LoyaltyService {
  private readonly dataService = inject(DataService);
  private readonly imageUploadService = inject(ImageUploadService);

  // State signals
  private readonly _loyaltyLevels = signal<LoyaltyLevel[]>([]);
  private readonly _benefits = signal<LoyaltyBenefit[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _maxLevel = signal<LoyaltyLevel | null>(null);

  // Readonly signals
  readonly loyaltyLevels = this._loyaltyLevels.asReadonly();
  readonly benefits = this._benefits.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly maxLevel = this._maxLevel.asReadonly();

  // Level icons (static data)
  readonly levelIcons: LevelIcon[] = [
    { id: 1, name: 'Bronce', levelIcon: 'bronze-medal' },
    { id: 2, name: 'Plata', levelIcon: 'silver-medal' },
    { id: 3, name: 'Oro', levelIcon: 'gold-medal' },
    { id: 4, name: 'Diamante', levelIcon: 'diamond-medal' },
    { id: 5, name: 'Titanio', levelIcon: 'platinum-medal' }
  ];

  /**
   * Load all loyalty levels
   */
  loadLoyaltyLevels(): void {
    this._isLoading.set(true);

    this.dataService
      .get$<LoyaltyLevel[]>('LoyaltyLevel/ListLoyaltyLevels')
      .subscribe({
        next: (levels) => {
          this._loyaltyLevels.set(levels);

          // Calculate max level
          if (levels.length > 0) {
            const max = levels.reduce((maxLvl, level) =>
              level.maxPointsLevel > maxLvl.maxPointsLevel ? level : maxLvl
            );
            this._maxLevel.set(max);
          }

          this._isLoading.set(false);
        },
        error: (error: unknown) => {
          console.error('Error loading loyalty levels:', error);
          this._loyaltyLevels.set([]);
          this._isLoading.set(false);
        }
      });
  }

  /**
   * Load all benefits
   */
  loadBenefits(): void {
    this.dataService
      .get$<LoyaltyBenefit[]>('LoyaltyLevel/ListBenefits')
      .subscribe({
        next: (benefits) => {
          this._benefits.set(benefits);
        },
        error: (error: unknown) => {
          console.error('Error loading benefits:', error);
          this._benefits.set([]);
        }
      });
  }

  /**
   * Get loyalty level by ID
   */
  getLevelById(levelId: number): Observable<LoyaltyLevel> {
    return this.dataService.get$<LoyaltyLevel>(
      'LoyaltyLevel/DetailLoyaltyLevels',
      { loyaltyLevelId: levelId }
    );
  }

  /**
   * Get available benefit types
   */
  getBenefitTypes(): Observable<BenefitCode[]> {
    return this.dataService.get$<BenefitCode[]>('LoyaltyLevel/walletTypes');
  }

  /**
   * Get point threshold for a level
   */
  getLevelPointThreshold(levelId: number): Observable<MinMaxPoints> {
    return this.dataService.get$<MinMaxPoints>(
      'LoyaltyLevel/GetLoyaltyLevelPointThreshold',
      { loyaltyLevelId: levelId }
    );
  }

  /**
   * Create a new loyalty level
   */
  createLevel(levelData: CreateLoyaltyLevelRequest): Observable<LoyaltyLevel> {
    return this.dataService
      .post$<LoyaltyLevel>('LoyaltyLevel/CreateLoyaltyLevel', levelData)
      .pipe(
        tap((newLevel) => {
          // Add to local state
          this._loyaltyLevels.update(levels => [...levels, newLevel]);
        })
      );
  }

  /**
   * Update an existing loyalty level
   */
  updateLevel(
    levelId: number,
    levelData: CreateLoyaltyLevelRequest
  ): Observable<LoyaltyLevel> {
    return this.dataService
      .put$<LoyaltyLevel>(
        `LoyaltyLevel/UpdateLoyaltyLevel?idLoyLevel=${levelId}`,
        levelData
      )
      .pipe(
        tap((updatedLevel) => {
          // Update local state
          this._loyaltyLevels.update(levels =>
            levels.map(level =>
              level.idLoyaltyLevel === levelId ? updatedLevel : level
            )
          );
        })
      );
  }

  /**
   * Update loyalty level status (active/inactive)
   */
  updateLevelStatus(levelId: number, status: boolean): Observable<any> {
    return this.dataService
      .put$<any>(
        `LoyaltyLevel/UpdateStatusLoyaltyLevel?idLoyLevel=${levelId}&status=${status}`,
        {}
      )
      .pipe(
        tap((response) => {
          // Update local state
          this._loyaltyLevels.update(levels =>
            levels.map(level =>
              level.idLoyaltyLevel === levelId
                ? { ...level, isActive: response.isActive }
                : level
            )
          );
        })
      );
  }

  /**
   * Get list of brands
   */
  getBrands(): Observable<Brand[]> {
    return this.dataService.get$<Brand[]>('Brand/BrandList');
  }

  /**
   * Get products for a specific brand
   */
  getProducts(brandId: number): Observable<Product[]> {
    return this.dataService.get$<Product[]>(
      'Incentives/products',
      { brandId }
    );
  }

  /**
   * Get modifiers for a specific product
   */
  getModifiers(productId: string, brand: string): Observable<ModifierResponse> {
    return this.dataService.get$<ModifierResponse>(
      'Incentives/modifiers',
      { productId, brand }
    );
  }

  /**
   * Upload loyalty level icon image
   */
  uploadLevelIcon(name: string, file: File): Observable<string> {
    return this.imageUploadService.uploadLoyaltyImage(name, file);
  }
}
