import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

/**
 * KpiBipbipPageComponent
 *
 * Dashboard de KPIs principales de BipBip
 */
@Component({
  selector: 'app-kpi-bipbip-page',
  imports: [CommonModule, CardModule],
  templateUrl: './kpi-bipbip-page.component.html',
  styleUrls: ['./kpi-bipbip-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiBipbipPageComponent {
  readonly isLoading = signal(false);
}
