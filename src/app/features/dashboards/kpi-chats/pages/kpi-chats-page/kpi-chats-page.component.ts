import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

/**
 * KpiChatsPageComponent
 *
 * Dashboard de métricas de soporte al cliente (chats SAC)
 */
@Component({
  selector: 'app-kpi-chats-page',
  imports: [CommonModule, CardModule],
  templateUrl: './kpi-chats-page.component.html',
  styleUrls: ['./kpi-chats-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiChatsPageComponent {
  readonly isLoading = signal(false);
}
