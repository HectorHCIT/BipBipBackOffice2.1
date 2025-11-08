import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { DriverDetails } from '../../models';
import { OrderTrackingService } from '../../services';

@Component({
  selector: 'app-driver-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    SkeletonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './driver-details-dialog.component.html',
  styleUrl: './driver-details-dialog.component.scss'
})
export class DriverDetailsDialogComponent implements OnInit {
  readonly dialogRef = inject(DynamicDialogRef);
  readonly config = inject(DynamicDialogConfig);
  readonly orderTrackingService = inject(OrderTrackingService);
  private readonly messageService = inject(MessageService);

  readonly driverId: number = this.config.data.driverId;

  readonly driverDetails = signal<DriverDetails | null>(null);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.loadDriverDetails();
  }

  /**
   * Carga los detalles del driver
   */
  loadDriverDetails(): void {
    this.isLoading.set(true);
    this.orderTrackingService.getDriverDetails(this.driverId).subscribe({
      next: (details) => {
        this.driverDetails.set(details);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar detalles del driver:', error);
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los detalles del driver'
        });
      }
    });
  }

  /**
   * Cierra el diálogo
   */
  close(): void {
    this.dialogRef.close();
  }
}
