import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';

/**
 * FrecuenciaCompraComponent
 *
 * Componente placeholder para análisis de frecuencia de compra de clientes.
 * Mostrará métricas como:
 * - Clientes frecuentes vs ocasionales
 * - Promedio de compras por período
 * - Tendencias de recompra
 * - Segmentación de clientes por frecuencia
 */
@Component({
  selector: 'app-frecuencia-compra',
  imports: [
    CommonModule,
    CardModule,
    SkeletonModule
  ],
  templateUrl: './frecuencia-compra.component.html',
  styleUrls: ['./frecuencia-compra.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FrecuenciaCompraComponent {
  readonly isLoading = signal(false);
}
