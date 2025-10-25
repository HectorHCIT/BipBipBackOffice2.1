import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataService } from '@core/services/data.service';
import { EmbeddableManagerService } from '@core/services/embeddable-manager.service';
import type { TokenDash } from '@core/models';

/**
 * Brand específico para Home (incluye shortName)
 */
export interface HomeBrand {
  id: number;
  name: string;
  image: string;
  shortName: string;
}

/**
 * Response de Brand/BrandList endpoint
 */
interface HomeBrandResponse {
  idBrand: number;
  nameBrand: string;
  logoBrand: string;
  shortNameBrand: string;
}

/**
 * HomeService - Modernizado con Signals (Angular 20)
 *
 * Servicios para la página Home:
 * - Lista de marcas con shortName (Brand/BrandList endpoint)
 * - Dashboard tokens
 *
 * NOTA: Este endpoint es diferente a GlobalDataService.brands()
 * que usa Brand/BrandsListSorted y NO incluye shortName
 */
@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private readonly dataService = inject(DataService);
  private readonly embeddableManager = inject(EmbeddableManagerService);

  /**
   * Obtener lista de marcas con shortName
   * Usa endpoint Brand/BrandList que incluye shortName
   */
  getBrandList(): Observable<HomeBrand[]> {
    return this.dataService.get$<HomeBrandResponse[]>('Brand/BrandList').pipe(
      map(response => response.map(brand => ({
        id: brand.idBrand,
        name: brand.nameBrand,
        image: brand.logoBrand,
        shortName: brand.shortNameBrand
      })))
    );
  }

  /**
   * Obtener token para el dashboard principal de Home
   * Usa Embeddable.com para renderizar el dashboard
   */
  getDashboardToken(): Observable<TokenDash | null> {
    return new Observable(observer => {
      this.embeddableManager.getTokenByKey('Dash')
        .then(token => {
          observer.next(token);
          observer.complete();
        })
        .catch(error => {
          console.error('Error obteniendo token de dashboard:', error);
          observer.next(null);
          observer.complete();
        });
    });
  }
}
