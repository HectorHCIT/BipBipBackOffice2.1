import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';

// Services and models
import { SignalMonitoringService } from '../../services/signal-monitoring.service';
import {
  IMonitoringSignalRRedis,
  CityList,
  getPaymentMethodName,
} from '../../models/signal-monitoring.model';

@Component({
  selector: 'app-signal-monitoring',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    SelectModule,
    InputTextModule,
    CardModule,
    ToastModule,
    BreadcrumbModule,
    ConfirmDialogModule,
  ],
  templateUrl: './signal-monitoring.component.html',
  styleUrl: './signal-monitoring.component.scss',
  providers: [MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalMonitoringComponent implements OnInit {
  private readonly signalMonitoringService = inject(SignalMonitoringService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  // Breadcrumb
  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Contingencias', routerLink: '/contingencies' },
    { label: 'Monitoreo de Señal' },
  ];

  // Signals
  readonly cities = signal<CityList[]>([]);
  readonly orders = signal<IMonitoringSignalRRedis[]>([]);
  readonly selectedCity = signal<number | null>(null);
  readonly searchTerm = signal<string>('');
  readonly isLoading = signal<boolean>(false);

  // Computed - Filtrado local de órdenes
  readonly filteredOrders = computed(() => {
    const orders = this.orders();
    const search = this.searchTerm().toLowerCase().trim();

    if (!search) {
      return orders;
    }

    return orders.filter((order) => {
      const orderNumber = order.idOrder.toString();
      const restaurantName = order.store.name.toLowerCase();
      const commandNumber = order.payment.idCommand.toString();

      return (
        orderNumber.includes(search) ||
        restaurantName.includes(search) ||
        commandNumber.includes(search)
      );
    });
  });

  // Helper para acceder a la función desde el template
  getPaymentMethodName = getPaymentMethodName;

  ngOnInit(): void {
    this.loadCities();
  }

  /**
   * Cargar lista de ciudades
   */
  private loadCities(): void {
    this.signalMonitoringService.getCities().subscribe({
      next: (cities) => {
        this.cities.set(cities);
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las ciudades',
        });
      },
    });
  }

  /**
   * Cargar órdenes de una ciudad
   */
  onCityChange(): void {
    const cityId = this.selectedCity();

    if (!cityId) {
      this.orders.set([]);
      return;
    }

    this.isLoading.set(true);

    this.signalMonitoringService.getOrdersByCity(cityId).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.isLoading.set(false);

        if (orders.length === 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'Sin resultados',
            detail: 'No hay órdenes en cola para esta ciudad',
          });
        }
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las órdenes',
        });
      },
    });
  }

  /**
   * Confirmar eliminación de orden
   */
  confirmDelete(order: IMonitoringSignalRRedis): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar la orden #${order.idOrder} del restaurante ${order.store.name}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteOrder(order);
      },
    });
  }

  /**
   * Eliminar orden de Redis/SignalR
   */
  private deleteOrder(order: IMonitoringSignalRRedis): void {
    const cityId = this.selectedCity();

    if (!cityId) {
      return;
    }

    this.signalMonitoringService.deleteOrder(cityId, order.idOrder).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Orden #${order.idOrder} eliminada correctamente`,
        });

        // Recargar órdenes
        this.onCityChange();
      },
      error: (error) => {
        console.error('Error deleting order:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar la orden',
        });
      },
    });
  }

  /**
   * Formatear fecha a formato legible
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-HN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  }
}
