import {
  Component,
  OnInit,
  inject,
  input,
  signal,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

import { RestaurantService } from '../../../services/restaurant.service';
import { ScaleDialogComponent } from './scale-dialog/scale-dialog.component';
import type { Scale } from '../../../models/scale.model';

@Component({
  selector: 'app-scale-tab',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    ToggleSwitchModule,
    ScaleDialogComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './scale-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScaleTabComponent implements OnInit {
  private readonly restaurantService = inject(RestaurantService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  // Input
  readonly restaurantId = input.required<number>();

  // Dialog state
  readonly showDialog = signal<boolean>(false);
  readonly selectedScale = signal<Scale | null>(null);
  readonly dialogMode = signal<'create' | 'edit'>('create');

  // Reference to service signals
  readonly scales = this.restaurantService.scales;
  readonly isLoading = this.restaurantService.isLoadingScales;

  // Computed for display
  readonly scalesWithRange = computed(() => {
    return this.scales().map(scale => ({
      ...scale,
      rangeDisplay: `${scale.minimum} - ${scale.maximum} km`
    }));
  });

  readonly activeScalesCount = computed(() => {
    return this.scales().filter(scale => scale.active).length;
  });

  ngOnInit(): void {
    this.loadScales();
  }

  /**
   * Load scales for the restaurant
   */
  loadScales(): void {
    const restId = this.restaurantId();
    this.restaurantService.getScales(restId).subscribe({
      error: (error) => {
        console.error('Error loading scales:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las escalas'
        });
      }
    });
  }

  /**
   * Open dialog to create new scale
   */
  openCreateDialog(): void {
    this.dialogMode.set('create');
    this.selectedScale.set(null);
    this.showDialog.set(true);
  }

  /**
   * Open dialog to edit scale
   */
  openEditDialog(scale: Scale): void {
    this.dialogMode.set('edit');
    this.selectedScale.set(scale);
    this.showDialog.set(true);
  }

  /**
   * Handle dialog close
   */
  onDialogClose(): void {
    this.showDialog.set(false);
    this.selectedScale.set(null);
  }

  /**
   * Handle successful save from dialog
   */
  onScaleSaved(): void {
    this.showDialog.set(false);
    this.selectedScale.set(null);
    this.loadScales();
  }

  /**
   * Toggle scale active status
   */
  toggleScaleStatus(scale: Scale): void {
    const updatedData = {
      id: scale.id,
      customerCharge: scale.customerCharge,
      deliveryPayment: scale.deliveryPayment,
      active: !scale.active,
      minimum: scale.minimum,
      maximum: scale.maximum
    };

    this.restaurantService.updateScale(updatedData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Escala ${scale.active ? 'desactivada' : 'activada'} correctamente`
        });
        this.loadScales();
      },
      error: (error) => {
        console.error('Error updating scale status:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el estado de la escala'
        });
      }
    });
  }

  /**
   * Delete scale with confirmation
   */
  deleteScale(scale: Scale): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar la escala de ${scale.minimum} - ${scale.maximum} km?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const restId = this.restaurantId();
        this.restaurantService.deleteScale(restId, scale.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Escala eliminada correctamente'
            });
            this.loadScales();
          },
          error: (error) => {
            console.error('Error deleting scale:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar la escala'
            });
          }
        });
      }
    });
  }

  /**
   * Format currency for display
   */
  formatCurrency(value: number): string {
    return `L ${value.toFixed(2)}`;
  }
}
