import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { PushTypeEnum } from '../../models';

@Component({
  selector: 'app-notification-preview',
  standalone: true,
  imports: [CommonModule, CardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-preview.component.html',
  styleUrl: './notification-preview.component.scss'
})
export class NotificationPreviewComponent {
  // Inputs
  readonly title = input<string>('');
  readonly message = input<string>('');
  readonly imageUrl = input<string>('');
  readonly type = input<PushTypeEnum>(PushTypeEnum.ALERT);
  readonly actionUrl = input<string>('');

  // Computed
  readonly typeLabel = computed(() => {
    switch (this.type()) {
      case PushTypeEnum.ALERT: return 'Alerta';
      case PushTypeEnum.PRODUCT: return 'Producto';
      case PushTypeEnum.PROMOTION: return 'Promoción';
      default: return 'Notificación';
    }
  });
}
