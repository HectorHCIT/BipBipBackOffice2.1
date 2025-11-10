import { Component, input, output, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DelayedOrdersService } from '../../services';
import { DelayedOrder, Driver } from '../../models';

@Component({
  selector: 'app-assign-driver-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    SkeletonModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './assign-driver-dialog.component.html',
  styleUrl: './assign-driver-dialog.component.scss'
})
export class AssignDriverDialogComponent {
  private readonly delayedOrdersService = inject(DelayedOrdersService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  // Inputs
  readonly visible = input.required<boolean>();
  readonly order = input.required<DelayedOrder>();

  // Outputs
  readonly visibleChange = output<boolean>();
  readonly confirm = output<void>();

  // Local signals
  readonly searchTerm = signal('');
  readonly isAssigning = signal(false);

  // Computed
  readonly availableDrivers = computed(() => this.delayedOrdersService.availableDrivers());

  /**
   * Filtra drivers por ciudad de la orden y término de búsqueda
   */
  readonly filteredDrivers = computed(() => {
    const drivers = this.availableDrivers();
    const orderCityId = this.order().cityId;
    const search = this.searchTerm().toLowerCase().trim();

    let filtered = drivers;

    // Filtrar por ciudad de la orden
    filtered = filtered.filter(driver => driver.idCity === orderCityId);

    // Filtrar solo disponibles (primeros 50)
    filtered = filtered.filter(driver => driver.driverStatusName === 'Disponible').slice(0, 50);

    // Filtrar por búsqueda
    if (search) {
      filtered = filtered.filter(driver =>
        driver.driverCode.toLowerCase().includes(search) ||
        driver.driverFullName.toLowerCase().includes(search)
      );
    }

    return filtered;
  });

  /**
   * Confirma la asignación del driver
   */
  confirmAssignment(driver: Driver): void {
    this.confirmationService.confirm({
      header: 'Confirmar asignación',
      message: `¿Desea asignar al driver ${driver.driverFullName} a la orden #${this.order().ordersId}?`,
      icon: 'pi pi-question-circle',
      acceptLabel: 'Sí, asignar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-info',
      accept: () => {
        this.assignDriver(driver.driverId);
      }
    });
  }

  /**
   * Asigna el driver a la orden
   */
  private assignDriver(driverId: number): void {
    this.isAssigning.set(true);

    const payload = {
      orderId: this.order().ordersId,
      driverId
    };

    this.delayedOrdersService.assignDriverToOrder(payload).subscribe({
      next: () => {
        this.isAssigning.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Driver asignado correctamente'
        });
        this.confirm.emit();
      },
      error: (error) => {
        console.error('Error al asignar driver:', error);
        this.isAssigning.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo asignar el driver'
        });
      }
    });
  }

  /**
   * Cierra el diálogo
   */
  close(): void {
    this.visibleChange.emit(false);
  }

  /**
   * Obtiene la severidad del tag según el estado del driver
   */
  getDriverStatusSeverity(status: string): 'success' | 'warn' {
    return status === 'Disponible' ? 'success' : 'warn';
  }
}
