import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { type AssignmentByCity } from '../../../models';

/**
 * CitySummaryPanelComponent
 *
 * Displays a summary of assignments grouped by city
 * Shows real-time count of orders per city/country
 */
@Component({
  selector: 'app-city-summary-panel',
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    TagModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-card header="Asignaciones por Ciudad" styleClass="h-full">
      <div class="min-h-[200px]">
        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-8 min-h-[200px]">
            <i class="pi pi-spin pi-spinner text-2xl text-primary"></i>
            <p class="text-gray-500 mt-2">Cargando...</p>
          </div>
        } @else if (assignmentsByCity().length === 0) {
          <div class="flex flex-col items-center justify-center py-8 min-h-[200px]">
            <i class="pi pi-inbox text-3xl text-gray-400 mb-2"></i>
            <p class="text-gray-500">Sin datos disponibles</p>
          </div>
        } @else {
          <p-table
            [value]="assignmentsByCity()"
            styleClass="p-datatable-sm p-datatable-striped"
            responsiveLayout="scroll">

            <ng-template pTemplate="header">
              <tr>
                <th>Ciudad</th>
                <th style="width: 4rem; text-align: center">Órdenes</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>
              <tr>
                <td>
                  <div class="flex items-center gap-3">
                    @if (item.countryUrlFlag) {
                      <img
                        [src]="item.countryUrlFlag"
                        [alt]="item.countryName"
                        class="w-8 h-6 object-cover rounded shadow-sm flex-shrink-0" />
                    }
                    <div class="flex flex-col gap-1">
                      <div class="font-semibold">{{ item.cityName }}</div>
                      <div class="text-sm text-gray-500">
                        {{ item.countryName }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="text-center">
                  <p-tag
                    [value]="item.qtyOrders.toString()"
                    severity="info">
                  </p-tag>
                </td>
              </tr>
            </ng-template>
          </p-table>

          <!-- Total count -->
          <div class="flex items-center justify-end px-4 py-3 border-t border-gray-200 mt-4">
            <span class="font-semibold">Total de órdenes:</span>
            <p-tag
              [value]="getTotalOrders().toString()"
              severity="info"
              styleClass="ml-2">
            </p-tag>
          </div>
        }
      </div>
    </p-card>
  `
})
export class CitySummaryPanelComponent {
  // Inputs
  readonly assignmentsByCity = input.required<AssignmentByCity[]>();
  readonly loading = input<boolean>(false);

  /**
   * Calculate total orders across all cities
   */
  getTotalOrders(): number {
    return this.assignmentsByCity().reduce((sum, item) => sum + item.qtyOrders, 0);
  }
}
