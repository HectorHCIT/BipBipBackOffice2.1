import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DataService } from '@core/services/data.service';
import { GlobalDataService } from '@core/services/global-data.service';
import type {
  Brand,
  CreateBrandRequest,
  UpdateBrandRequest,
  UpdatePositionRequest
} from '../models/brand.model';

/**
 * BrandService - Servicio para gestión de marcas
 *
 * Modernizado con Signals (Angular 20)
 * ✅ Signals para estado reactivo
 * ✅ DataService para HTTP
 * ✅ Integración con GlobalDataService para cache
 */
@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private readonly dataService = inject(DataService);
  private readonly globalDataService = inject(GlobalDataService);

  // 🔥 SIGNALS - Estado reactivo
  readonly brands = signal<Brand[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly selectedBrand = signal<Brand | null>(null);

  /**
   * Obtener todas las marcas
   */
  getBrands(): Observable<Brand[]> {
    this.isLoading.set(true);

    return this.dataService.get$<Brand[]>('Brand/BrandList').pipe(
      tap(brands => {
        this.brands.set(brands);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Obtener marca por ID
   */
  getBrandById(id: number): Observable<Brand> {
    this.isLoading.set(true);

    return this.dataService.get$<Brand>(`Brand/BrandById?BrandId=${id}`).pipe(
      tap(brand => {
        this.selectedBrand.set(brand);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Crear nueva marca
   */
  createBrand(brand: CreateBrandRequest): Observable<Brand> {
    this.isLoading.set(true);

    return this.dataService.post$<Brand>('Brand/CreateBrand', brand).pipe(
      tap(() => {
        this.isLoading.set(false);
        // Refrescar cache global de marcas
        this.globalDataService.forceRefresh('brands');
        // Recargar lista local
        this.getBrands().subscribe();
      })
    );
  }

  /**
   * Actualizar marca existente
   */
  updateBrand(id: number, brand: UpdateBrandRequest): Observable<Brand> {
    this.isLoading.set(true);

    return this.dataService.put$<Brand>(
      `Brand/UpdateBrand?idBrand=${id}`,
      brand
    ).pipe(
      tap(() => {
        this.isLoading.set(false);
        // Refrescar cache global de marcas
        this.globalDataService.forceRefresh('brands');
        // Recargar lista local
        this.getBrands().subscribe();
      })
    );
  }

  /**
   * Activar/Desactivar marca
   */
  enableBrand(brandId: number, status: boolean): Observable<Brand> {
    this.isLoading.set(true);

    return this.dataService.put$<Brand>(
      `Brand/EnableBrand?BrandId=${brandId}&statusBrand=${status}`,
      null
    ).pipe(
      tap(() => {
        // Actualizar en la lista local
        const currentBrands = this.brands();
        const updatedBrands = currentBrands.map(b =>
          b.idBrand === brandId ? { ...b, isActiveBrand: status } : b
        );
        this.brands.set(updatedBrands);
        this.isLoading.set(false);

        // Refrescar cache global de marcas
        this.globalDataService.forceRefresh('brands');
      })
    );
  }

  /**
   * Actualizar posiciones de múltiples marcas (drag & drop)
   */
  updatePositions(positions: UpdatePositionRequest[]): Observable<Brand[]> {
    this.isLoading.set(true);

    return this.dataService.put$<Brand[]>(
      'Brand/UpdatePositionBrands',
      positions
    ).pipe(
      tap(() => {
        this.isLoading.set(false);
        // Refrescar cache global de marcas
        this.globalDataService.forceRefresh('brands');
        // Recargar lista local
        this.getBrands().subscribe();
      })
    );
  }

  /**
   * Subir imagen de marca (logo, header, menu)
   * Usa el servicio global de upload de imágenes
   */
  uploadImage(name: string, file: File, optimize: boolean = false): Observable<string> {
    // Este método será implementado cuando integremos con ImageUploadService
    // Por ahora retornamos el nombre del archivo como placeholder
    return new Observable(observer => {
      // TODO: Integrar con ImageUploadService global
      observer.next(`https://placeholder.com/${name}`);
      observer.complete();
    });
  }

  /**
   * Limpiar selección
   */
  clearSelection(): void {
    this.selectedBrand.set(null);
  }
}
