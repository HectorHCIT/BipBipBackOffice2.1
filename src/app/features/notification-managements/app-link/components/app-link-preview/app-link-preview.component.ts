import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

/**
 * App Link Preview Component
 * Displays a mobile-style preview of how the app link will look
 * Replicates the mobile app experience with header, content, and footer
 */
@Component({
  selector: 'app-app-link-preview',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, ButtonModule],
  templateUrl: './app-link-preview.component.html',
  styleUrls: ['./app-link-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLinkPreviewComponent {
  // Inputs
  readonly image = input<string>('');
  readonly title = input<string>('Título del enlace');
  readonly description = input<string>('Descripción del enlace dinámico');
  readonly useCustomImage = input<boolean>(false);
  readonly brandName = input<string>('');
  readonly pendingFields = input<number>(0);

  // Computed
  readonly currentTime = computed(() => {
    const now = new Date();
    return now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  });

  readonly imageType = computed(() =>
    this.useCustomImage() ? 'Imagen personalizada' : 'Imagen del producto'
  );

  readonly imageTypeSeverity = computed(() =>
    this.useCustomImage() ? 'info' : 'success'
  );

  readonly pendingMessage = computed(() => {
    const count = this.pendingFields();
    if (count === 0) return 'Formulario completo';
    return `${count} campo${count > 1 ? 's' : ''} pendiente${count > 1 ? 's' : ''}`;
  });
}
