import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { TrackOrderDetails } from '../../models';

@Component({
  selector: 'app-driver-assignment',
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    BadgeModule,
    AvatarModule,
    DividerModule,
    TooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './driver-assignment.component.html',
  styleUrl: './driver-assignment.component.scss'
})
export class DriverAssignmentComponent {
  // Inputs
  readonly orderDetail = input.required<TrackOrderDetails>();
  readonly isLoading = input<boolean>(false);

  // Outputs
  readonly assignDriver = output<void>();
  readonly reassignDriver = output<void>();
  readonly releaseDriver = output<void>();
  readonly viewDriverDetails = output<number>();
  readonly penalizeDriver = output<number>();

  // Computed properties
  readonly hasDriver = computed(() => {
    const order = this.orderDetail();
    // Usar idDriver en lugar de driverId (el API devuelve idDriver)
    return order.idDriver !== null && order.idDriver !== undefined && order.idDriver > 0;
  });

  readonly driverStatusSeverity = computed(() => {
    const status = this.orderDetail().driverStatus?.toLowerCase();
    switch (status) {
      case 'disponible':
      case 'available':
        return 'success';
      case 'ocupado':
      case 'busy':
        return 'warn';
      case 'inactivo':
      case 'inactive':
        return 'secondary';
      default:
        return 'info';
    }
  });

  readonly driverRating = computed(() => {
    const order = this.orderDetail();
    return order.ratingDriver || 0;
  });

  readonly driverInitials = computed(() => {
    const name = this.orderDetail().nameDriver || this.orderDetail().driverName || '';
    if (!name) return '??';

    const parts = name.trim().split(' ').filter(part => part.length > 0);
    if (parts.length >= 2 && parts[0].length > 0 && parts[1].length > 0) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase() || '??';
  });

  onAssignDriver(): void {
    this.assignDriver.emit();
  }

  onReassignDriver(): void {
    this.reassignDriver.emit();
  }

  onReleaseDriver(): void {
    this.releaseDriver.emit();
  }

  onViewDriverDetails(): void {
    const driverId = this.orderDetail().idDriver || this.orderDetail().driverId;
    if (driverId) {
      this.viewDriverDetails.emit(driverId);
    }
  }

  onPenalizeDriver(): void {
    const driverId = this.orderDetail().idDriver || this.orderDetail().driverId;
    if (driverId) {
      this.penalizeDriver.emit(driverId);
    }
  }
}
