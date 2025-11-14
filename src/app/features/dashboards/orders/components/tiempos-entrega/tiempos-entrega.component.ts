import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';

/**
 * TiemposEntregaComponent
 *
 * Dashboard de análisis de tiempos de entrega y performance
 */
@Component({
  selector: 'app-tiempos-entrega',
  imports: [
    CommonModule,
    CardModule,
    SkeletonModule
  ],
  templateUrl: './tiempos-entrega.component.html',
  styleUrls: ['./tiempos-entrega.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TiemposEntregaComponent {
  readonly isLoading = signal(false);
}
