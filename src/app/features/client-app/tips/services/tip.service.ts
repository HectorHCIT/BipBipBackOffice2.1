import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { DataService } from '@core/services/data.service';
import { TipList, TipDetail, TipPayload } from '../models';

/**
 * TipService
 *
 * Servicio para gestión de configuraciones de propinas
 * Usa signals para estado reactivo
 */
@Injectable({ providedIn: 'root' })
export class TipService {
  private readonly dataService = inject(DataService);

  readonly tips = signal<TipList[]>([]);
  readonly isLoading = signal(false);

  /**
   * Obtener lista de configuraciones de propinas
   */
  getTipList(): Observable<TipList[]> {
    this.isLoading.set(true);
    return this.dataService.get$<TipList[]>('Tips/TipList').pipe(
      tap(tips => {
        this.tips.set(tips);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Obtener detalle de configuración por país
   */
  getTipById(idCountry: number): Observable<TipDetail> {
    return this.dataService.get$<TipDetail>('Tips/TipsById', { id: idCountry });
  }

  /**
   * Actualizar configuración de propinas
   */
  updateTip(idCountry: number, payload: TipPayload): Observable<any> {
    return this.dataService.put$('Tips/UpdateDetailsTips', payload, { idCountry });
  }

  /**
   * Habilitar/deshabilitar propinas para un país
   */
  enableTip(idCountry: number, enable: boolean): Observable<any> {
    return this.dataService.put$('Tips/EnableTips', null, { idCountry });
  }
}
