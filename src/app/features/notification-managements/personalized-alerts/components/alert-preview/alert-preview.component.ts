import {
  Component,
  Input,
  ChangeDetectionStrategy,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { COMMON_ALERT_ICONS } from '../../models';

/**
 * Alert Preview Component
 * Displays a live preview of how the personalized alert will look
 *
 * Shows the alert with the configured colors, icon, title, and subtitle
 */
@Component({
  selector: 'app-alert-preview',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './alert-preview.component.html',
  styleUrls: ['./alert-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertPreviewComponent {
  private readonly _iconId = signal('info');
  private readonly _textColor = signal('FFFFFF');
  private readonly _backgroundColor = signal('3B82F6');
  private readonly _title = signal('Título de la alerta');
  private readonly _subtitle = signal('Subtítulo o descripción de la alerta');

  @Input() set icon(value: string) {
    this._iconId.set(value);
  }

  @Input() set textColor(value: string) {
    this._textColor.set(value);
  }

  @Input() set backgroundColor(value: string) {
    this._backgroundColor.set(value);
  }

  @Input() set title(value: string) {
    this._title.set(value);
  }

  @Input() set subtitle(value: string) {
    this._subtitle.set(value);
  }

  // Computed signals for display
  readonly displayIconImage = computed(() => {
    const iconId = this._iconId();
    const icon = COMMON_ALERT_ICONS.find(i => i.id === iconId);
    return icon?.image || '/alert-custom/info.svg';
  });

  readonly displayTitle = this._title.asReadonly();
  readonly displaySubtitle = this._subtitle.asReadonly();

  readonly textColorStyle = computed(() => {
    const color = this._textColor();
    return color.startsWith('#') ? color : `#${color}`;
  });

  readonly backgroundColorStyle = computed(() => {
    const color = this._backgroundColor();
    return color.startsWith('#') ? color : `#${color}`;
  });
}
