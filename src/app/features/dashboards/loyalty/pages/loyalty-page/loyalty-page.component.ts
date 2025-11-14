import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

/**
 * LoyaltyPageComponent
 *
 * Dashboard de análisis de programa de lealtad
 */
@Component({
  selector: 'app-loyalty-page',
  imports: [CommonModule, CardModule],
  templateUrl: './loyalty-page.component.html',
  styleUrls: ['./loyalty-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoyaltyPageComponent {
  readonly isLoading = signal(false);
}
