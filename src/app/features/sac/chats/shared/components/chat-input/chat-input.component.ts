import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  inject,
  OnDestroy,
  ChangeDetectorRef,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PopoverModule } from 'primeng/popover';
import { EmojiPickerComponent } from '../emoji-picker';
import { MessageSubmitData } from './chat-input.types';

/**
 * Componente de input para mensajes de chat
 *
 * Soporta:
 * - Envío de mensajes de texto
 * - Adjuntar imágenes (drag & drop y selector)
 * - Preview de imágenes
 * - Enter para enviar
 * - Estados de carga
 */
@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TextareaModule,
    ProgressSpinnerModule,
    PopoverModule,
    EmojiPickerComponent
  ],
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatInputComponent implements OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('emojiPanel') emojiPanel: any;

  @Input() chatId = '';
  @Input() disabled = false;
  @Input() placeholder = 'Escribir mensaje...';
  @Input() showFileAttach = true;
  @Input() showPredefinedResponses = true;
  @Input() isAdmin = false;

  @Output() sendMessage = new EventEmitter<MessageSubmitData>();
  @Output() openPredefinedResponses = new EventEmitter<void>();
  @Output() uploadingStateChange = new EventEmitter<boolean>();

  // Estado del componente
  message = '';
  selectedImage: string | null = null;
  selectedImageFile: File | null = null;
  sendingImage = false;
  imageLoadError = false;
  isDragging = false;
  showEmojiPicker = signal(false);

  /**
   * Maneja el cambio en el input de texto
   */
  onMessageInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.message = target.value;
  }

  /**
   * Maneja el enter para enviar (Shift+Enter para nueva línea)
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSubmit();
    }
  }

  /**
   * Abre el selector de archivos
   */
  triggerFileInput(): void {
    this.fileInput?.nativeElement?.click();
  }

  /**
   * Maneja la selección de archivo
   */
  async onFileSelected(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      this.clearImage();
      return;
    }

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      console.error('El archivo seleccionado no es una imagen');
      this.clearImage();
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('La imagen es demasiado grande. Máximo 5MB');
      this.clearImage();
      return;
    }

    this.selectedImageFile = file;

    // Crear preview instantáneo con URL.createObjectURL
    try {
      // Limpiar URL anterior si existe para evitar memory leaks
      if (this.selectedImage && this.selectedImage.startsWith('blob:')) {
        URL.revokeObjectURL(this.selectedImage);
      }

      // Crear URL instantánea (mucho más rápido que FileReader)
      this.selectedImage = URL.createObjectURL(file);
      this.imageLoadError = false;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error al crear preview de imagen:', error);
      this.imageLoadError = true;
      this.clearImage();
    }
  }

  /**
   * Limpia la imagen seleccionada
   */
  clearImage(): void {
    // Limpiar object URL para liberar memoria
    if (this.selectedImage && this.selectedImage.startsWith('blob:')) {
      URL.revokeObjectURL(this.selectedImage);
    }

    this.selectedImage = null;
    this.selectedImageFile = null;
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
    this.cdr.markForCheck();
  }

  /**
   * Maneja el envío del mensaje
   */
  handleSubmit(): void {
    // Validar que haya mensaje o imagen
    if (!this.message.trim() && !this.selectedImageFile) {
      return;
    }

    // Emitir el evento con los datos
    const messageData: MessageSubmitData = {
      message: this.message.trim(),
      imageFile: this.selectedImageFile,
      imageUrl: this.selectedImage,
      chatId: this.chatId
    };

    this.sendingImage = !!this.selectedImageFile;

    // Emitir estado de carga si hay imagen
    if (this.selectedImageFile) {
      this.uploadingStateChange.emit(true);
    }

    this.sendMessage.emit(messageData);

    // No limpiar hasta confirmar que se envió
    // Se limpia desde el componente padre llamando a finishUpload()
  }

  /**
   * Limpia el formulario después de enviar
   */
  clearForm(): void {
    this.message = '';
    this.clearImage();
    this.sendingImage = false;
    this.uploadingStateChange.emit(false);
    this.cdr.markForCheck();
  }

  /**
   * Método público para indicar que terminó el upload desde el componente padre
   */
  finishUpload(): void {
    this.sendingImage = false;
    this.uploadingStateChange.emit(false);
    this.clearForm();
  }

  /**
   * Abre el diálogo de respuestas predefinidas
   */
  openResponseDialog(): void {
    this.openPredefinedResponses.emit();
  }

  /**
   * Toggle emoji picker
   */
  toggleEmojiPicker(event: Event): void {
    this.emojiPanel.toggle(event);
  }

  /**
   * Maneja la selección de un emoji
   */
  addEmoji(emoji: string): void {
    const textarea = this.messageInput.nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Insertar emoji en la posición del cursor
    this.message = this.message.substring(0, start) + emoji + this.message.substring(end);

    // Actualizar vista y foco
    this.cdr.markForCheck();

    // Cerrar el popover
    this.emojiPanel.hide();

    // Restaurar posición del cursor después del emoji
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + emoji.length;
      textarea.setSelectionRange(newPosition, newPosition);
    });
  }

  /**
   * Establece el mensaje desde fuera del componente (para respuestas predefinidas)
   */
  setMessage(message: string): void {
    this.message = message;

    // Forzar actualización de la vista
    this.cdr.detectChanges();

    // También actualizar el valor del textarea directamente si existe
    if (this.messageInput?.nativeElement) {
      this.messageInput.nativeElement.value = message;
      // Disparar evento input para que Angular detecte el cambio
      const event = new Event('input', { bubbles: true });
      this.messageInput.nativeElement.dispatchEvent(event);
    }

    // Enfocar el input
    setTimeout(() => {
      this.messageInput?.nativeElement?.focus();
    }, 0);
  }

  /**
   * Obtiene el tamaño del archivo formateado
   */
  getFileSize(): string {
    if (!this.selectedImageFile) return '';

    const bytes = this.selectedImageFile.size;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Obtiene el nombre del archivo truncado si es muy largo
   */
  getFileName(): string {
    if (!this.selectedImageFile) return 'Imagen';

    const name = this.selectedImageFile.name;
    if (name.length > 20) {
      const extension = name.split('.').pop();
      return name.substring(0, 15) + '...' + extension;
    }
    return name;
  }

  /**
   * Maneja el evento drag over
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  /**
   * Maneja el evento drag leave
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  /**
   * Maneja el evento drop
   */
  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      console.error('El archivo soltado no es una imagen');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    this.selectedImageFile = file;

    // Crear preview instantáneo con URL.createObjectURL
    try {
      // Limpiar URL anterior si existe para evitar memory leaks
      if (this.selectedImage && this.selectedImage.startsWith('blob:')) {
        URL.revokeObjectURL(this.selectedImage);
      }

      // Crear URL instantánea
      this.selectedImage = URL.createObjectURL(file);
      this.imageLoadError = false;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error al crear preview de imagen:', error);
      this.imageLoadError = true;
      this.clearImage();
    }
  }

  /**
   * Limpieza al destruir el componente
   */
  ngOnDestroy(): void {
    // Limpiar object URL si existe para evitar memory leaks
    if (this.selectedImage && this.selectedImage.startsWith('blob:')) {
      URL.revokeObjectURL(this.selectedImage);
    }
  }
}
