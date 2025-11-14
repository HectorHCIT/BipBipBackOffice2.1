import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { DatosGeneralesComponent } from '../../components/datos-generales';
import { KpiClientesComponent } from '../../components/kpi-clientes';

/**
 * CustomersPageComponent
 *
 * Dashboard de análisis y seguimiento de clientes con múltiples vistas:
 * - Datos Generales: Dashboard general de clientes
 * - KPI Clientes: Indicadores clave de desempeño de clientes
 */
@Component({
  selector: 'app-customers-page',
  imports: [
    CommonModule,
    CardModule,
    TabsModule,
    DatosGeneralesComponent,
    KpiClientesComponent
  ],
  templateUrl: './customers-page.component.html',
  styleUrls: ['./customers-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersPageComponent {
  readonly activeTabIndex = signal(0);

  /**
   * Maneja el cambio de tab
   */
  onTabChange(event: any): void {
    this.activeTabIndex.set(event.index);
  }
}
