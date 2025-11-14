import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

/**
 * DriversPageComponent
 *
 * Dashboard de performance de conductores (deliveries)
 */
@Component({
  selector: 'app-drivers-page',
  imports: [CommonModule, CardModule],
  templateUrl: './drivers-page.component.html',
  styleUrls: ['./drivers-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversPageComponent {
  readonly isLoading = signal(false);
}
