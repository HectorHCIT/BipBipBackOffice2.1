import {
  Component,
  Input,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

/**
 * App Link Preview Component
 * Displays a mobile-style preview of how the app link will look
 */
@Component({
  selector: 'app-app-link-preview',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule],
  templateUrl: './app-link-preview.component.html',
  styleUrls: ['./app-link-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLinkPreviewComponent {
  private readonly _image = signal('');
  private readonly _title = signal('Título del enlace');
  private readonly _description = signal('Descripción del enlace dinámico');
  private readonly _useCustomImage = signal(false);

  @Input() set image(value: string) {
    this._image.set(value);
  }

  @Input() set title(value: string) {
    this._title.set(value);
  }

  @Input() set description(value: string) {
    this._description.set(value);
  }

  @Input() set useCustomImage(value: boolean) {
    this._useCustomImage.set(value);
  }

  readonly displayImage = this._image.asReadonly();
  readonly displayTitle = this._title.asReadonly();
  readonly displayDescription = this._description.asReadonly();
  readonly displayUseCustomImage = this._useCustomImage.asReadonly();
}
