import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { DriverList, ReAssignDriver } from '../../models';
import { OrderTrackingService } from '../../services';

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-assign-driver-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    AutoCompleteModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './assign-driver-dialog.component.html',
  styleUrl: './assign-driver-dialog.component.scss'
})
export class AssignDriverDialogComponent implements OnInit {
  readonly dialogRef = inject(DynamicDialogRef);
  readonly config = inject(DynamicDialogConfig);
  readonly orderTrackingService = inject(OrderTrackingService);
  private readonly messageService = inject(MessageService);

  readonly orderId: number = this.config.data.orderId;
  readonly cityId: number = this.config.data.cityId;
  readonly type: 'assign' | 'reassign' = this.config.data.type;

  // Driver selection signals
  readonly drivers = signal<DriverList[]>([]);
  readonly filteredDrivers = signal<DriverList[]>([]);
  selectedDriver: DriverList | null = null;
  readonly isLoadingDrivers = signal(false);
  readonly isSubmitting = signal(false);

  // Getter
  canSubmit(): boolean {
    return this.selectedDriver !== null && !this.isSubmitting();
  }

  readonly dialogTitle = computed(() => {
    return this.type === 'assign' ? 'Asignar Driver' : 'Reasignar Driver';
  });

  ngOnInit(): void {
    this.loadDrivers();
  }

  /**
   * Carga los drivers disponibles de la ciudad
   */
  loadDrivers(): void {
    this.isLoadingDrivers.set(true);
    this.orderTrackingService.getDriverByCity(this.cityId).subscribe({
      next: (drivers) => {
        this.drivers.set(drivers);
        this.filteredDrivers.set(drivers); // Inicializar con todos los drivers
        this.isLoadingDrivers.set(false);
      },
      error: (error) => {
        console.error('Error al cargar drivers:', error);
        this.isLoadingDrivers.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los drivers disponibles'
        });
      }
    });
  }

  /**
   * Filtra los drivers según la búsqueda del autocomplete
   */
  filterDrivers(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    const filtered = this.drivers().filter(driver =>
      driver.fullNameDriver.toLowerCase().includes(query) ||
      driver.codeDriver.toLowerCase().includes(query)
    );
    this.filteredDrivers.set(filtered);
  }

  /**
   * Asigna o reasigna el driver
   */
  submit(): void {
    const driver = this.selectedDriver;
    if (!driver) return;

    this.isSubmitting.set(true);

    const data: ReAssignDriver = {
      orderId: this.orderId,
      driverId: driver.idDriver,
      comments: ''
    };

    const action$ = this.type === 'assign'
      ? this.orderTrackingService.assignDriver(data)
      : this.orderTrackingService.reassignDriver(data);

    action$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Driver ${this.type === 'assign' ? 'asignado' : 'reasignado'} exitosamente`
        });
        this.dialogRef.close({
          success: true,
          driverName: driver.fullNameDriver,
          driverId: driver.idDriver
        });
      },
      error: (error) => {
        console.error('Error al asignar driver:', error);
        this.isSubmitting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo ${this.type === 'assign' ? 'asignar' : 'reasignar'} el driver`
        });
      }
    });
  }

  /**
   * Cierra el diálogo sin guardar
   */
  close(): void {
    this.dialogRef.close();
  }
}
