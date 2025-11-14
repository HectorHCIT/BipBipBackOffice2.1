import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

/**
 * ZonesMapPageComponent
 *
 * Dashboard de mapa de zonas con geolocalización
 */
@Component({
  selector: 'app-zones-map-page',
  imports: [CommonModule, CardModule],
  templateUrl: './zones-map-page.component.html',
  styleUrls: ['./zones-map-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZonesMapPageComponent {
  readonly isLoading = signal(false);
}
