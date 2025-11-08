import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ToastModule } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OrderTrackingService } from '../../services';
import { TrackOrderDetails, CreateIncidentRequest } from '../../models';
import { environment } from '../../../../../../environments/environment';
import { AuthService } from '../../../../../core/services/auth.service';
import {
  DriverAssignmentComponent,
  CompleteOrderDialogComponent,
  SendOrderDialogComponent,
  CreateIncidentDialogComponent,
  CancelOrderDialogComponent,
  AssignDriverDialogComponent,
  ReleaseDriverDialogComponent,
  PenalizeDriverDialogComponent,
  DriverDetailsDialogComponent
} from '../../components';

@Component({
  selector: 'app-order-detail-page',
  imports: [
    CommonModule,
    TabsModule,
    ButtonModule,
    BadgeModule,
    CardModule,
    BreadcrumbModule,
    ToastModule,
    DriverAssignmentComponent,
    CompleteOrderDialogComponent,
    SendOrderDialogComponent,
    CreateIncidentDialogComponent
  ],
  providers: [MessageService, DialogService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-detail-page.component.html',
  styleUrl: './order-detail-page.component.scss'
})
export class OrderDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderTrackingService = inject(OrderTrackingService);
  private readonly messageService = inject(MessageService);
  private readonly dialogService = inject(DialogService);
  private readonly authService = inject(AuthService);
  private dialogRef: DynamicDialogRef | null = null;

  // Order number from route
  readonly orderId = signal<number | null>(null);

  // Order data
  readonly orderDetail = signal<TrackOrderDetails | null>(null);
  readonly isLoading = signal(true);
  readonly notFound = signal(false);

  // Tab management
  readonly activeTabIndex = signal(0);

  // Dialog visibility
  readonly showCompleteDialog = signal(false);
  readonly showSendDialog = signal(false);
  readonly showIncidentDialog = signal(false);

  // Action loading states
  readonly completeLoading = signal(false);
  readonly sendLoading = signal(false);
  readonly incidentLoading = signal(false);

  // Breadcrumb
  readonly breadcrumbItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [
      { label: 'SAC', route: '/sac' },
      { label: 'Seguimiento de Pedidos', route: '/sac/order-tracking' }
    ];

    const order = this.orderDetail();
    if (order) {
      items.push({ label: `Orden #${order.numOrder}` });
    }

    return items;
  });

  readonly home: MenuItem = { icon: 'pi pi-home', route: '/' };

  // Computed properties
  readonly isExpressOrder = computed(() => this.orderDetail()?.isExpress || false);
  readonly isCancelled = computed(() =>
    this.orderDetail()?.orderStatus.toUpperCase() === 'CANCELADO'
  );
  readonly statusSeverity = computed(() => {
    const status = this.orderDetail()?.orderStatus.toUpperCase();
    return status === 'CANCELADO' ? 'danger' : 'success';
  });

  // Button visibility computed properties
  readonly userRole = computed(() => this.authService.userRole());

  readonly canShowSendButton = computed(() => {
    const order = this.orderDetail();
    if (!order) return false;
    // Visible si NO tiene número de factura POSGC
    return !order.posgc;
  });

  readonly canShowCompleteButton = computed(() => {
    const order = this.orderDetail();
    const role = this.userRole();
    if (!order) return false;

    // No mostrar si está cancelada o entregada
    const statusUpper = order.orderStatus?.toUpperCase() || '';
    if (statusUpper === 'CANCELADO' || statusUpper === 'CANCELADA' || statusUpper === 'ENTREGADA') {
      return false;
    }

    // Verificar permisos por rol (fallback simple)
    const hasPermission = role === 'Administrador' || role === 'SSAC';
    if (!hasPermission) return false;

    // Si es delivery (channelId 1 o 3), debe tener driver asignado
    if (order.channelId === 1 || order.channelId === 3) {
      return order.idDriver !== null && order.idDriver !== undefined && order.idDriver > 0;
    }

    // Si es pick-up (channelId 2), siempre visible (con permisos)
    return true;
  });

  readonly canShowCancelButton = computed(() => {
    const order = this.orderDetail();
    const role = this.userRole();
    if (!order) return false;

    // No mostrar si ya está cancelada
    const statusUpper = order.orderStatus?.toUpperCase() || '';
    if (statusUpper === 'CANCELADO' || statusUpper === 'CANCELADA') {
      return false;
    }

    // Solo Administrador y SSAC pueden cancelar (SAC NO puede)
    return role === 'Administrador' || role === 'SSAC';
  });

  ngOnInit(): void {
    // Get order ID from route
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderId.set(Number(id));
      this.loadOrderDetail(Number(id));
    } else {
      this.notFound.set(true);
      this.isLoading.set(false);
    }
  }

  /**
   * Carga el detalle de la orden
   */
  loadOrderDetail(orderId: number): void {
    this.isLoading.set(true);
    this.notFound.set(false);

    this.orderTrackingService.getOrderDetail(orderId).subscribe({
      next: (detail) => {
        this.orderDetail.set(detail);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading order detail:', error);
        this.notFound.set(true);
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el detalle de la orden'
        });
      }
    });
  }

  /**
   * Navega de regreso a la lista de órdenes
   */
  goBack(): void {
    this.router.navigate(['/sac/order-tracking']);
  }

  /**
   * Recarga el detalle de la orden
   */
  reload(): void {
    const id = this.orderId();
    if (id) {
      this.loadOrderDetail(id);
    }
  }

  /**
   * Handler methods for driver assignment component
   */
  onAssignDriver(): void {
    const order = this.orderDetail();
    if (!order) return;

    this.dialogRef = this.dialogService.open(AssignDriverDialogComponent, {
      header: 'Asignar Driver',
      width: '500px',
      data: {
        orderId: order.numOrder,
        cityId: order.cityId || 1,
        type: 'assign'
      }
    });

    this.dialogRef?.onClose.subscribe((result) => {
      if (result?.success) {
        this.reload();
      }
    });
  }

  onReassignDriver(): void {
    const order = this.orderDetail();
    if (!order) return;

    this.dialogRef = this.dialogService.open(AssignDriverDialogComponent, {
      header: 'Reasignar Driver',
      width: '500px',
      data: {
        orderId: order.numOrder,
        cityId: order.cityId || 1,
        type: 'reassign'
      }
    });

    this.dialogRef?.onClose.subscribe((result) => {
      if (result?.success) {
        this.reload();
      }
    });
  }

  onReleaseDriver(): void {
    const order = this.orderDetail();
    if (!order) return;

    this.dialogRef = this.dialogService.open(ReleaseDriverDialogComponent, {
      header: 'Liberar Driver',
      width: '500px',
      data: {
        orderId: order.numOrder,
        driverId: order.idDriver,
        driverName: order.nameDriver
      }
    });

    this.dialogRef?.onClose.subscribe((result) => {
      if (result?.success) {
        this.reload();
      }
    });
  }

  onViewDriverDetails(driverId: number): void {
    this.dialogRef = this.dialogService.open(DriverDetailsDialogComponent, {
      header: 'Detalles del Driver',
      width: '450px',
      data: {
        driverId: driverId
      }
    });
  }

  onPenalizeDriver(driverId: number): void {
    const order = this.orderDetail();
    if (!order) return;

    this.dialogRef = this.dialogService.open(PenalizeDriverDialogComponent, {
      header: 'Penalizar Driver',
      width: '600px',
      data: {
        id: driverId,
        name: order.nameDriver
      }
    });

    this.dialogRef?.onClose.subscribe((result) => {
      if (result?.success) {
        this.reload();
      }
    });
  }

  /**
   * Action button handlers
   */
  onCompleteOrderClick(): void {
    this.showCompleteDialog.set(true);
  }

  onSendOrderClick(): void {
    this.showSendDialog.set(true);
  }

  onCancelOrderClick(): void {
    const order = this.orderDetail();
    if (!order) return;

    this.dialogRef = this.dialogService.open(CancelOrderDialogComponent, {
      header: 'Cancelar Orden',
      width: '600px',
      data: {
        order: order
      }
    });

    this.dialogRef?.onClose.subscribe((result) => {
      if (result?.success) {
        this.reload();
      }
    });
  }

  onCreateIncidentClick(): void {
    this.showIncidentDialog.set(true);
  }

  onChatClick(): void {
    const order = this.orderDetail();
    if (!order) return;

    // TODO: Implementar diálogo de chat
    this.messageService.add({
      severity: 'info',
      summary: 'Chat',
      detail: 'Funcionalidad de chat en desarrollo'
    });
  }

  /**
   * Dialog confirmation handlers
   */
  onConfirmComplete(): void {
    const orderId = this.orderId();
    if (!orderId) return;

    this.completeLoading.set(true);
    this.orderTrackingService.completeOrder(orderId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Orden completada exitosamente'
        });
        this.completeLoading.set(false);
        this.showCompleteDialog.set(false);
        this.reload();
      },
      error: (error) => {
        console.error('Error completing order:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo completar la orden'
        });
        this.completeLoading.set(false);
      }
    });
  }

  onConfirmSend(): void {
    const orderId = this.orderId();
    if (!orderId) return;

    this.sendLoading.set(true);
    this.orderTrackingService.sendOrder(orderId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Orden enviada exitosamente'
        });
        this.sendLoading.set(false);
        this.showSendDialog.set(false);
        this.reload();
      },
      error: (error) => {
        console.error('Error sending order:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo enviar la orden'
        });
        this.sendLoading.set(false);
      }
    });
  }

  onConfirmIncident(incidentData: CreateIncidentRequest): void {
    this.incidentLoading.set(true);
    this.orderTrackingService.createIncident(incidentData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Incidencia creada exitosamente'
        });
        this.incidentLoading.set(false);
        this.showIncidentDialog.set(false);
        this.reload();
      },
      error: (error) => {
        console.error('Error creating incident:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo crear la incidencia'
        });
        this.incidentLoading.set(false);
      }
    });
  }

  /**
   * Descarga la factura de la orden en PDF
   */
  downloadInvoice(): void {
    const id = this.orderId();
    if (!id) return;

    const invoiceUrl = `${environment.invoicesURL}${id}.pdf`;
    window.open(invoiceUrl, '_blank');
  }
}
