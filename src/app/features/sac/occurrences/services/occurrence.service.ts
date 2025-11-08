import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { DataService } from '@core/services/data.service';
import { Occurrence, EditOccurrenceDto, OccurrenceType, OccurrenceReason } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OccurrenceService {
  private readonly dataService = inject(DataService);

  // State signals
  readonly occurrences = signal<Occurrence[]>([]);
  readonly isLoading = signal(false);

  // Computed signals
  readonly hasOccurrences = computed(() => this.occurrences().length > 0);
  readonly occurrenceCount = computed(() => this.occurrences().length);

  /**
   * Obtiene todas las ocurrencias/incidencias del sistema
   */
  getOccurrences(): Observable<Occurrence[]> {
    this.isLoading.set(true);
    return this.dataService.get$<Occurrence[]>('OrderTracking/ocurrencies').pipe(
      tap({
        next: (occurrences) => {
          this.occurrences.set(occurrences);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }

  /**
   * Elimina una ocurrencia por su ID
   */
  deleteOccurrence(id: number): Observable<void> {
    return this.dataService.delete$<void>(`OrderTracking/DeleteOcurrency/${id}`).pipe(
      tap(() => {
        // Actualizar el estado local eliminando la ocurrencia
        this.occurrences.update(occurrences =>
          occurrences.filter(occ => occ.id !== id)
        );
      })
    );
  }

  /**
   * Agrega o actualiza una solución para una incidencia
   */
  addSolution(dto: EditOccurrenceDto): Observable<void> {
    return this.dataService.post$<void>('OrderTracking/incidents/solution', dto);
  }

  /**
   * Obtiene los tipos de incidencias disponibles
   */
  getOccurrenceTypes(): Observable<OccurrenceType[]> {
    return this.dataService.get$<OccurrenceType[]>('OrderTracking/ocurrences/types');
  }

  /**
   * Obtiene las razones de incidencia según el tipo
   */
  getOccurrenceReasons(type: string): Observable<OccurrenceReason[]> {
    return this.dataService.get$<OccurrenceReason[]>('OrderTracking/ocurrences', { type });
  }

  /**
   * Genera el reporte de ocurrencias en formato Excel
   * @param fechaInicio - Fecha de inicio del rango (formato ISO o YYYY-MM-DD)
   * @param fechaFinal - Fecha final del rango (formato ISO o YYYY-MM-DD)
   * @param marcas - IDs de marcas separadas por coma (ej: "1,2,3")
   * @param ciudades - IDs de ciudades separadas por coma (ej: "1,2,3")
   */
  generateReport(
    fechaInicio: string,
    fechaFinal: string,
    marcas: string,
    ciudades: string
  ): Observable<Blob> {
    // El endpoint devuelve un archivo Excel en base64
    return this.dataService.get$<any>('Reports/Ocurrences', {
      fechaInicio,
      fechaFinal,
      marcas,
      ciudades
    });
  }

  /**
   * Limpia el estado del servicio
   */
  clearState(): void {
    this.occurrences.set([]);
    this.isLoading.set(false);
  }
}
