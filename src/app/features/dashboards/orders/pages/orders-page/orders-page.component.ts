import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { OrdersGeneralComponent } from '../../components/orders-general';
import { IncidenciasComponent } from '../../components/incidencias';
import { TiemposEntregaComponent } from '../../components/tiempos-entrega';
import { FrecuenciaCompraComponent } from '../../components/frecuencia-compra';

/**
 * OrdersPageComponent
 *
 * Dashboard de seguimiento y análisis de órdenes con múltiples vistas:
 * - Órdenes: Dashboard general de órdenes
 * - Incidencias: Tracking de incidencias en órdenes
 * - Tiempos de Entrega: Análisis de tiempos de entrega
 * - Frecuencia de Compra: Análisis de frecuencia de compra de clientes
 */
@Component({
  selector: 'app-orders-page',
  imports: [
    CommonModule,
    CardModule,
    TabsModule,
    OrdersGeneralComponent,
    IncidenciasComponent,
    TiemposEntregaComponent,
    FrecuenciaCompraComponent
  ],
  templateUrl: './orders-page.component.html',
  styleUrls: ['./orders-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersPageComponent {
  readonly activeTabIndex = signal(0);

  /**
   * Maneja el cambio de tab
   */
  onTabChange(event: any): void {
    this.activeTabIndex.set(event.index);
  }
}
