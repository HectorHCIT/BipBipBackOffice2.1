import { Component, input, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { OrderIncidentManual } from '../../models';

@Component({
  selector: 'app-occurrences-list',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './occurrences-list.component.html',
  styleUrl: './occurrences-list.component.scss'
})
export class OccurrencesListComponent {
  // Inputs
  readonly incidents = input.required<OrderIncidentManual[]>();

  // Computed
  readonly isEmpty = computed(() => this.incidents().length === 0);
  readonly hasSolutions = (incident: OrderIncidentManual): boolean => {
    return incident.solution && incident.solution.length > 0;
  };
}
