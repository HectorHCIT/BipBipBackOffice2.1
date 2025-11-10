import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';

// Services & Models
import { OrderTrackingService } from '../../../order-tracking/services';
import { CancellationRequest } from '../../models';

@Component({
  selector: 'app-cancellation-requests-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    BreadcrumbModule,
    TagModule,
    SkeletonModule,
    ToastModule
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cancellation-requests-page.component.html',
  styleUrl: './cancellation-requests-page.component.scss'
})
export class CancellationRequestsPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly orderTrackingService = inject(OrderTrackingService);
  private readonly messageService = inject(MessageService);

  // Breadcrumb
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'SAC', routerLink: '/sac' },
    { label: 'Solicitudes de Cancelación' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Local signals
  readonly allCancellationRequests = signal<CancellationRequest[]>([]);
  readonly isLoading = signal(false);
  readonly searchTerm = signal('');

  // Computed signals
  readonly hasSearch = computed(() => this.searchTerm().trim() !== '');

  // Filtrado local
  readonly filteredRequests = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const requests = this.allCancellationRequests();

    if (!search) {
      return requests;
    }

    return requests.filter(request =>
      request.orderId.toString().includes(search) ||
      (request.posgcOrderId?.toString().includes(search)) ||
      request.channelName.toLowerCase().includes(search) ||
      request.storeName.toLowerCase().includes(search) ||
      request.userRequest.toLowerCase().includes(search) ||
      request.comment.toLowerCase().includes(search)
    );
  });

  ngOnInit(): void {
    this.loadCancellationRequests();
  }

  /**
   * Carga todas las solicitudes de cancelación
   */
  loadCancellationRequests(): void {
    console.log('📋 [CANCELLATION-REQUESTS] loadCancellationRequests');

    this.isLoading.set(true);

    this.orderTrackingService.getCancellationRequests().subscribe({
      next: (response) => {
        console.log('✅ [CANCELLATION-REQUESTS] Response:', response);
        this.allCancellationRequests.set(response.data || response || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ [CANCELLATION-REQUESTS] Error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las solicitudes de cancelación'
        });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Limpia la búsqueda
   */
  clearSearch(): void {
    this.searchTerm.set('');
  }

  /**
   * Navega al detalle de la orden
   */
  viewOrderDetail(orderId: number): void {
    this.router.navigate(['/sac/order-tracking', orderId]);
  }

  /**
   * Obtiene la severidad del estado
   */
  getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
    switch (status) {
      case 'Aprobada':
        return 'success';
      case 'Rechazada':
        return 'danger';
      case 'Pendiente':
        return 'warn';
      default:
        return 'info';
    }
  }

  /**
   * Formatea la fecha
   */
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-HN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Opciones de paginación
   */
  readonly rowsPerPageOptions = [10, 20, 30, 50];
}
