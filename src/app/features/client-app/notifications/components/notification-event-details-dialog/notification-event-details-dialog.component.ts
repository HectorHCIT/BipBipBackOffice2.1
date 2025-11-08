import { Component, ChangeDetectionStrategy, input, output, computed, signal, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { NotificationEvent, PushTypeEnum, LaunchType } from '../../models';
import { SmsAuthorizationDialogComponent } from '../sms-authorization-dialog/sms-authorization-dialog.component';
import { NotificationService } from '../../services';
import { inject } from '@angular/core';

@Component({
  selector: 'app-notification-event-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    TagModule,
    SmsAuthorizationDialogComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-event-details-dialog.component.html',
  styleUrl: './notification-event-details-dialog.component.scss'
})
export class NotificationEventDetailsDialogComponent {
  private readonly notificationService = inject(NotificationService);

  // Inputs & Outputs
  readonly visible = model<boolean>(false);
  readonly event = input<NotificationEvent | null>(null);
  readonly notificationActivated = output<void>();

  // State
  readonly showSmsDialog = signal(false);

  // Computed
  readonly notification = computed(() => {
    const event = this.event();
    if (!event) return null;
    return event.extendedProps.originalPush;
  });

  readonly notificationId = computed(() => {
    const notif = this.notification();
    return notif?.codPN || null;
  });

  readonly canActivate = computed(() => {
    const notif = this.notification();
    if (!notif) return false;

    return !notif.isProcessed &&
           notif.status &&
           notif.isPushNotification;
  });

  readonly typeLabel = computed(() => {
    const notif = this.notification();
    if (!notif) return '';

    if (!notif.isPushNotification) return 'SMS';

    switch (notif.typePN) {
      case PushTypeEnum.ALERT: return 'Alerta';
      case PushTypeEnum.PRODUCT: return 'Producto';
      case PushTypeEnum.PROMOTION: return 'Promoción';
      default: return 'Push';
    }
  });

  readonly typeIcon = computed(() => {
    const notif = this.notification();
    if (!notif) return 'pi-bell';

    if (!notif.isPushNotification) return 'pi-comment';

    switch (notif.typePN) {
      case PushTypeEnum.ALERT: return 'pi-exclamation-triangle';
      case PushTypeEnum.PRODUCT: return 'pi-shopping-bag';
      case PushTypeEnum.PROMOTION: return 'pi-tag';
      default: return 'pi-bell';
    }
  });

  readonly typeSeverity = computed(() => {
    const notif = this.notification();
    if (!notif) return 'info';

    if (!notif.isPushNotification) return 'info';

    switch (notif.typePN) {
      case PushTypeEnum.ALERT: return 'warn';
      case PushTypeEnum.PRODUCT: return 'success';
      case PushTypeEnum.PROMOTION: return 'danger';
      default: return 'info';
    }
  });

  readonly launchTypeLabel = computed(() => {
    const notif = this.notification();
    if (!notif) return '';

    switch (notif.launchType) {
      case LaunchType.ONE_HOT: return 'Inmediato';
      case LaunchType.SCHEDULE: return 'Programado';
      case LaunchType.RECURRENT: return 'Recurrente';
      default: return '';
    }
  });

  readonly statusLabel = computed(() => {
    const notif = this.notification();
    if (!notif) return '';
    return notif.status ? 'Activo' : 'Inactivo';
  });

  readonly processedLabel = computed(() => {
    const notif = this.notification();
    if (!notif) return '';
    return notif.isProcessed ? 'Procesado' : 'Pendiente';
  });

  readonly formattedScheduleDate = computed(() => {
    const notif = this.notification();
    if (!notif?.scheduleDatePN) return '';

    const date = new Date(notif.scheduleDatePN);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  });

  /**
   * Abre el diálogo de autorización SMS
   */
  openActivationDialog(): void {
    this.visible.set(false);
    this.showSmsDialog.set(true);
  }

  /**
   * Maneja el éxito de la activación
   */
  onAuthorizationSuccess(): void {
    const notifId = this.notificationId();
    if (notifId) {
      this.notificationService.updateLocalNotificationStatus(notifId);
      this.notificationActivated.emit();
    }
  }

  /**
   * Maneja la cancelación de la autorización
   */
  onAuthorizationCancel(): void {
    // Reabre el diálogo de detalles
    this.visible.set(true);
  }
}
