import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';

/**
 * OrdersGeneralComponent
 *
 * Dashboard general de órdenes con KPIs y estadísticas principales
 */
@Component({
  selector: 'app-orders-general',
  imports: [
    CommonModule,
    CardModule,
    SkeletonModule
  ],
  templateUrl: './orders-general.component.html',
  styleUrls: ['./orders-general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersGeneralComponent {
  readonly isLoading = signal(false);
}
