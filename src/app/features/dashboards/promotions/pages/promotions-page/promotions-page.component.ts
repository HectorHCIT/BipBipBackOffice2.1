import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

/**
 * PromotionsPageComponent
 *
 * Dashboard de promociones y campañas
 */
@Component({
  selector: 'app-promotions-page',
  imports: [CommonModule, CardModule],
  templateUrl: './promotions-page.component.html',
  styleUrls: ['./promotions-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionsPageComponent {
  readonly isLoading = signal(false);
}
