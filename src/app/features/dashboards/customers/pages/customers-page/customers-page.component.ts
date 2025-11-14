import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

/**
 * CustomersPageComponent
 *
 * Dashboard de análisis de clientes
 */
@Component({
  selector: 'app-customers-page',
  imports: [CommonModule, CardModule],
  templateUrl: './customers-page.component.html',
  styleUrls: ['./customers-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersPageComponent {
  readonly isLoading = signal(false);
}
