import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { interval, Subscription } from 'rxjs';

/**
 * Pipe para mostrar tiempo transcurrido en tiempo real
 *
 * Actualiza automáticamente cada minuto para mostrar:
 * - "hace un momento" (menos de 1 minuto)
 * - "hace 5 min" (menos de 1 hora)
 * - "hace 2 horas" (menos de 1 día)
 * - "hace 3 días" (más de 1 día)
 *
 * Uso:
 * {{ chat.createdAt | tiempoReal }}
 */
@Pipe({
  name: 'tiempoReal',
  standalone: true,
  pure: false  // Impure para actualización automática
})
export class TiempoRealPipe implements PipeTransform, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  private subscription?: Subscription;
  private lastDate?: Date;

  transform(date: Date | string | number | null | undefined): string {
    if (!date) {
      return '';
    }

    // Convertir a Date si no lo es
    const dateObj = date instanceof Date ? date : new Date(date);

    // Si la fecha cambió, reiniciar subscription
    if (!this.lastDate || this.lastDate.getTime() !== dateObj.getTime()) {
      this.lastDate = dateObj;
      this.setupSubscription();
    }

    return this.calculateElapsedTime(dateObj);
  }

  /**
   * Configura actualización automática cada minuto
   */
  private setupSubscription(): void {
    // Limpiar subscription anterior
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Actualizar cada 60 segundos
    this.subscription = interval(60000).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  /**
   * Calcula el tiempo transcurrido
   */
  private calculateElapsedTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) {
      return 'hace un momento';
    } else if (diffMinutes < 60) {
      return `hace ${diffMinutes} min`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
