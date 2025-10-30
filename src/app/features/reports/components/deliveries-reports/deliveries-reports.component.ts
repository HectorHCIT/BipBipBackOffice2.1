import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';

// PrimeNG
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

// Report Components
import { ReportActivacionComponent } from './components/report-activacion/report-activacion.component';
import { ReportDeliveriesActivosComponent } from './components/report-deliveries-activos/report-deliveries-activos.component';
import { ReportDeliveriesActivosComandaComponent } from './components/report-deliveries-activos-comanda/report-deliveries-activos-comanda.component';
import { ReportDeliveriesInactivosComponent } from './components/report-deliveries-inactivos/report-deliveries-inactivos.component';
import { ReportDiasEntregaComponent } from './components/report-dias-entrega/report-dias-entrega.component';
import { ReportDeliveriesOrdenComponent } from './components/report-deliveries-orden/report-deliveries-orden.component';
import { ReportTiempoOrdenesComponent } from './components/report-tiempo-ordenes/report-tiempo-ordenes.component';
import { ReportBaseDriversComponent } from './components/report-base-drivers/report-base-drivers.component';
import { ReportIncidenciasComponent } from './components/report-incidencias/report-incidencias.component';

/**
 * DeliveriesReportsComponent - Contenedor principal de reportes de deliveries
 *
 * Componente hub que muestra un menú colapsable con 10 opciones de reportes.
 * Usa @switch para renderizar condicionalmente el reporte seleccionado.
 *
 * Estructura:
 * - Breadcrumb de navegación
 * - Menú colapsable con tarjetas de reportes
 * - Área de contenido con el reporte activo
 *
 * Patrón: Standalone component + Signals + OnPush + PrimeNG
 */
@Component({
  selector: 'app-deliveries-reports',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbModule,
    ButtonModule,
    CardModule,
    ReportActivacionComponent,
    ReportDeliveriesActivosComponent,
    ReportDeliveriesActivosComandaComponent,
    ReportDeliveriesInactivosComponent,
    ReportDiasEntregaComponent,
    ReportDeliveriesOrdenComponent,
    ReportTiempoOrdenesComponent,
    ReportBaseDriversComponent,
    ReportIncidenciasComponent
  ],
  templateUrl: './deliveries-reports.component.html',
  styleUrls: ['./deliveries-reports.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveriesReportsComponent {
  // ============================================================================
  // STATE SIGNALS
  // ============================================================================

  /**
   * ID del reporte actualmente seleccionado
   * 0 = ninguno, 1-10 = reportes específicos
   */
  readonly selectedReport = signal<number>(0);

  /**
   * Estado del menú colapsable
   * true = abierto, false = cerrado
   */
  readonly isMenuOpen = signal<boolean>(false);

  // ============================================================================
  // BREADCRUMB
  // ============================================================================

  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Reportes', routerLink: '/report' },
    { label: 'Deliveries' }
  ];

  // ============================================================================
  // LISTA DE REPORTES
  // ============================================================================

  readonly reportsList: Array<{ id: number; name: string; icon: string }> = [
    {
      id: 1,
      name: 'Deliveries Inactivos',
      icon: 'pi pi-user-minus'
    },
    {
      id: 2,
      name: 'Deliveries Activos',
      icon: 'pi pi-user-plus'
    },
    {
      id: 3,
      name: 'Deliveries Activos por Comanda',
      icon: 'pi pi-receipt'
    },
    {
      id: 4,
      name: 'Días de Entrega por Delivery',
      icon: 'pi pi-calendar'
    },
    {
      id: 5,
      name: 'Incidencias por Delivery',
      icon: 'pi pi-exclamation-triangle'
    },
    {
      id: 6,
      name: 'Tiempo por Órdenes',
      icon: 'pi pi-clock'
    },
    {
      id: 7,
      name: 'Deliveries por Orden',
      icon: 'pi pi-sort-amount-down'
    },
    {
      id: 8,
      name: 'Activaciones',
      icon: 'pi pi-check-circle'
    },
    {
      id: 9,
      name: 'BipPay',
      icon: 'pi pi-wallet'
    },
    {
      id: 10,
      name: 'Base de Drivers',
      icon: 'pi pi-building'
    }
  ];

  // ============================================================================
  // MÉTODOS
  // ============================================================================

  /**
   * Selecciona un reporte y cierra el menú
   * @param reportId - ID del reporte (1-10)
   */
  selectReport(reportId: number): void {
    this.selectedReport.set(reportId);
    this.isMenuOpen.set(false);
  }

  /**
   * Alterna el estado del menú colapsable
   * Si se cierra el menú y hay un reporte seleccionado, lo mantiene
   */
  toggleMenu(): void {
    this.isMenuOpen.update(isOpen => !isOpen);
  }

  /**
   * Resetea la selección y vuelve al estado inicial
   */
  clearSelection(): void {
    this.selectedReport.set(0);
    this.isMenuOpen.set(true);
  }
}
