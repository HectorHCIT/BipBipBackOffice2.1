import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';

// Models & Services
import { ScheduledOrder } from '../../models';
import { ScheduledOrderService } from '../../services';

@Component({
  selector: 'app-scheduled-orders-page',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    BreadcrumbModule,
    SkeletonModule,
    ToastModule,
    CurrencyPipe,
    DatePipe
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scheduled-orders-page.component.html',
  styleUrl: './scheduled-orders-page.component.scss'
})
export class ScheduledOrdersPageComponent implements OnInit {
  readonly scheduledOrderService = inject(ScheduledOrderService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  // Breadcrumb
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'SAC', routerLink: '/sac' },
    { label: 'Órdenes Programadas' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Computed signals
  readonly isLoading = computed(() => this.scheduledOrderService.isLoading());
  readonly scheduledOrders = computed(() => this.scheduledOrderService.scheduledOrders());

  ngOnInit(): void {
    this.loadScheduledOrders();
  }

  /**
   * Carga todas las órdenes programadas
   */
  loadScheduledOrders(): void {
    this.scheduledOrderService.getScheduledOrders().subscribe({
      error: (error) => {
        console.error('Error al cargar órdenes programadas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las órdenes programadas'
        });
      }
    });
  }

  /**
   * Navega al detalle de la orden
   * TODO: Implementar cuando se migre el módulo de order-tracking
   */
  viewOrderDetails(orderId: number): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Funcionalidad pendiente',
      detail: 'La navegación a detalles de orden estará disponible cuando se migre el módulo Order Tracking'
    });
    // Cuando esté listo:
    // this.router.navigate(['/sac/order-tracking/order-detail', orderId]);
  }
}
