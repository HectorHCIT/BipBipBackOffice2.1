import { Component, ChangeDetectionStrategy, signal, computed, inject, effect, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';

/**
 * Componente de visor de imágenes con zoom
 *
 * Características:
 * - Zoom in/out con botones
 * - Zoom con scroll del mouse
 * - Atajos de teclado (+, -, 0, Escape)
 * - Arrastrar para mover cuando está con zoom
 * - Botón de descarga
 * - Doble clic para resetear zoom
 */
@Component({
  selector: 'app-image-viewer-dialog',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './image-viewer-dialog.component.html',
  styleUrls: ['./image-viewer-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerDialogComponent {
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);

  // Referencias
  readonly imageContainer = viewChild<ElementRef<HTMLDivElement>>('imageContainer');
  readonly imageElement = viewChild<ElementRef<HTMLImageElement>>('imageElement');

  // Data del dialog
  readonly imageUrl = signal<string>(this.config.data?.imageUrl || '');

  // Estado del zoom
  readonly zoomLevel = signal<number>(1);
  readonly minZoom = 0.5;
  readonly maxZoom = 4;
  readonly zoomStep = 0.5;

  // Estado del drag
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private scrollLeft = 0;
  private scrollTop = 0;

  // Computeds
  readonly canZoomIn = computed(() => this.zoomLevel() < this.maxZoom);
  readonly canZoomOut = computed(() => this.zoomLevel() > this.minZoom);
  readonly zoomPercentage = computed(() => Math.round(this.zoomLevel() * 100));

  constructor() {
    // Agregar listeners de teclado
    effect(() => {
      const handleKeyPress = (event: KeyboardEvent) => {
        switch (event.key) {
          case '+':
          case '=':
            event.preventDefault();
            this.zoomIn();
            break;
          case '-':
          case '_':
            event.preventDefault();
            this.zoomOut();
            break;
          case '0':
            event.preventDefault();
            this.resetZoom();
            break;
          case 'Escape':
            this.close();
            break;
        }
      };

      window.addEventListener('keydown', handleKeyPress);

      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    });
  }

  /**
   * Aumentar zoom
   */
  zoomIn(): void {
    if (this.canZoomIn()) {
      this.zoomLevel.update(level => Math.min(level + this.zoomStep, this.maxZoom));
    }
  }

  /**
   * Disminuir zoom
   */
  zoomOut(): void {
    if (this.canZoomOut()) {
      this.zoomLevel.update(level => Math.max(level - this.zoomStep, this.minZoom));
    }
  }

  /**
   * Resetear zoom a 100%
   */
  resetZoom(): void {
    this.zoomLevel.set(1);
  }

  /**
   * Manejar zoom con scroll del mouse
   */
  onWheel(event: WheelEvent): void {
    event.preventDefault();

    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel() + delta));

    this.zoomLevel.set(newZoom);
  }

  /**
   * Iniciar drag
   */
  onMouseDown(event: MouseEvent): void {
    if (this.zoomLevel() <= 1) return; // Solo permitir drag si hay zoom

    this.isDragging = true;
    const container = this.imageContainer()?.nativeElement;
    if (!container) return;

    this.startX = event.pageX - container.offsetLeft;
    this.startY = event.pageY - container.offsetTop;
    this.scrollLeft = container.scrollLeft;
    this.scrollTop = container.scrollTop;

    container.style.cursor = 'grabbing';
  }

  /**
   * Mover mientras hace drag
   */
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    event.preventDefault();
    const container = this.imageContainer()?.nativeElement;
    if (!container) return;

    const x = event.pageX - container.offsetLeft;
    const y = event.pageY - container.offsetTop;
    const walkX = (x - this.startX) * 2; // Multiplicador para hacer el drag más rápido
    const walkY = (y - this.startY) * 2;

    container.scrollLeft = this.scrollLeft - walkX;
    container.scrollTop = this.scrollTop - walkY;
  }

  /**
   * Finalizar drag
   */
  onMouseUp(): void {
    this.isDragging = false;
    const container = this.imageContainer()?.nativeElement;
    if (container) {
      container.style.cursor = this.zoomLevel() > 1 ? 'grab' : 'default';
    }
  }

  /**
   * Doble clic para resetear zoom
   */
  onDoubleClick(): void {
    this.resetZoom();
  }

  /**
   * Descargar imagen
   */
  downloadImage(): void {
    const url = this.imageUrl();
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-image-${Date.now()}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Cerrar dialog
   */
  close(): void {
    this.dialogRef.close();
  }
}
