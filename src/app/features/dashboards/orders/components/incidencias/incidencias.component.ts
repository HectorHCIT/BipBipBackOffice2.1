import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';

/**
 * IncidenciasComponent
 *
 * Dashboard de tracking y análisis de incidencias en órdenes
 */
@Component({
  selector: 'app-incidencias',
  imports: [
    CommonModule,
    CardModule,
    SkeletonModule
  ],
  templateUrl: './incidencias.component.html',
  styleUrls: ['./incidencias.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidenciasComponent {
  readonly isLoading = signal(false);
}
