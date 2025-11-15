import { Injectable, signal, inject, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '@environments/environment';
import {
  ProductInPromotion,
  CreateProductInPromotion,
  ProductData
} from '../models';

/**
 * Servicio para gestión de productos en promoción
 * Maneja las operaciones CRUD y el estado global con signals
 */
@Injectable({
  providedIn: 'root'
})
export class ProductsInPromotionsService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  // Estado global con signals
  private readonly productsSignal = signal<ProductInPromotion[]>([]);

  /** Lista de productos en promoción (readonly) */
  readonly products = this.productsSignal.asReadonly();

  /**
   * Obtiene todos los productos en promoción desde el backend
   * @returns Observable con array de productos
   */
  getProductsInPromotions(): Observable<ProductInPromotion[]> {
    return this.http.get<ProductInPromotion[]>(`${environment.apiURL}Products/tags`);
  }

  /**
   * Crea un nuevo producto en promoción
   * @param product - Datos del producto a crear
   * @returns Observable con la respuesta del backend
   */
  createProductInPromotion(product: CreateProductInPromotion): Observable<any> {
    return this.http.post(`${environment.apiURL}Products/tags`, product);
  }

  /**
   * Obtiene un producto en promoción específico por ID
   * @param productCode - Código del producto
   * @param brandId - ID de la marca
   * @returns Observable con el producto
   */
  getProductInPromotionById(productCode: string, brandId: string): Observable<ProductInPromotion> {
    return this.http.get<ProductInPromotion>(
      `${environment.apiURL}Products/tags/${productCode}/${brandId}`
    );
  }

  /**
   * Actualiza un producto en promoción existente
   * Usa el mismo endpoint que crear (POST)
   * @param product - Datos del producto a actualizar
   * @returns Observable con la respuesta del backend
   */
  updateProductInPromotion(product: CreateProductInPromotion): Observable<any> {
    return this.http.post(`${environment.apiURL}Products/tags`, product);
  }

  /**
   * Elimina un producto en promoción
   * @param productCode - Código del producto
   * @param brandId - ID de la marca
   * @returns Observable con la respuesta del backend
   */
  deleteProductInPromotion(productCode: string, brandId: string): Observable<any> {
    return this.http.delete(`${environment.apiURL}Products/tags/${productCode}/${brandId}`);
  }

  /**
   * Obtiene los productos disponibles de una marca específica
   * Usado para popular el select de productos en el formulario
   * @param brandId - ID de la marca
   * @returns Observable con array de productos
   */
  getProductsByBrand(brandId: number): Observable<ProductData[]> {
    return this.http.get<ProductData[]>(
      `${environment.apiURL}Incentives/products?brandId=${brandId}`
    );
  }

  /**
   * Carga la lista de productos en promoción y actualiza el estado
   * Este método se puede llamar desde los componentes para refrescar los datos
   */
  loadProducts(): void {
    this.getProductsInPromotions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => this.productsSignal.set(products),
        error: (error) => {
          console.error('Error loading products in promotions:', error);
          this.productsSignal.set([]);
        }
      });
  }

  /**
   * Actualiza la lista local de productos (sin llamar al backend)
   * Útil para reflejar cambios inmediatos en la UI
   * @param products - Nueva lista de productos
   */
  updateLocalProductsList(products: ProductInPromotion[]): void {
    this.productsSignal.set(products);
  }

  /**
   * Elimina un producto de la lista local (sin llamar al backend)
   * Útil para optimistic updates
   * @param productId - ID del producto a eliminar
   * @param brandId - ID de la marca
   */
  removeProductFromLocalList(productId: string, brandId: string): void {
    const currentList = this.productsSignal();
    const updatedList = currentList.filter(
      product => !(product.productId === productId && product.brandId === brandId)
    );
    this.productsSignal.set(updatedList);
  }

  /**
   * Agrega o actualiza un producto en la lista local (sin llamar al backend)
   * Si el producto existe, lo actualiza; si no, lo agrega
   * @param product - Producto a agregar o actualizar
   */
  addOrUpdateProductInLocalList(product: ProductInPromotion): void {
    const currentList = this.productsSignal();
    const existingIndex = currentList.findIndex(
      p => p.productId === product.productId && p.brandId === product.brandId
    );

    if (existingIndex >= 0) {
      // Actualizar producto existente
      const updatedList = [...currentList];
      updatedList[existingIndex] = product;
      this.productsSignal.set(updatedList);
    } else {
      // Agregar nuevo producto
      this.productsSignal.set([...currentList, product]);
    }
  }

  /**
   * Limpia el estado local (vacía la lista)
   */
  clearProducts(): void {
    this.productsSignal.set([]);
  }
}
