import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DataViewModule } from 'primeng/dataview';
import { MenuModule } from 'primeng/menu';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Services y Modelos
import { AutomaticReplyService } from '../../services/automatic-reply.service';
import { AutomaticReply, AutomaticReplyFormData } from '../../models/automatic-reply.model';

/**
 * Dialog de respuestas predefinidas/automáticas
 *
 * Características:
 * - Modo Lista: Ver, buscar y seleccionar respuestas
 * - Modo Formulario: Crear/Editar respuestas
 * - CRUD completo con API backend
 * - Click en respuesta → inserta en chat input
 */
@Component({
  selector: 'app-predefined-responses-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    DataViewModule,
    MenuModule,
    TextareaModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './predefined-responses-dialog.component.html',
  styleUrls: ['./predefined-responses-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PredefinedResponsesDialogComponent implements OnInit {
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly automaticReplyService = inject(AutomaticReplyService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  // Estado
  readonly responses = signal<AutomaticReply[]>([]);
  readonly mode = signal<'list' | 'form'>('list');
  readonly editingId = signal<number | null>(null);
  readonly searchTerm = signal('');
  readonly formData = signal<AutomaticReplyFormData>({ title: '', response: '' });
  readonly isSubmitting = signal(false);
  readonly isLoading = signal(true);

  // Computeds
  readonly filteredResponses = computed(() => {
    const search = this.searchTerm().toLowerCase();
    if (!search) return this.responses();

    return this.responses().filter(r =>
      r.title.toLowerCase().includes(search) ||
      r.response.toLowerCase().includes(search)
    );
  });

  readonly characterCount = computed(() => this.formData().response.length);
  readonly isEditMode = computed(() => this.editingId() !== null);
  readonly canSubmit = computed(() => {
    const data = this.formData();
    return data.title.trim().length > 0 && data.response.trim().length > 0;
  });

  ngOnInit(): void {
    this.loadResponses();
  }

  /**
   * Carga las respuestas desde el backend
   */
  loadResponses(): void {
    this.isLoading.set(true);
    this.automaticReplyService.getAutomaticReplies().subscribe({
      next: (responses) => {
        this.responses.set(responses);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar respuestas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las respuestas automáticas'
        });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Selecciona una respuesta y la devuelve al parent
   */
  selectResponse(response: AutomaticReply): void {
    this.dialogRef.close({ response: response.response });
  }

  /**
   * Cambia entre modo lista y formulario
   */
  toggleMode(): void {
    if (this.mode() === 'list') {
      // Limpiar formulario al abrir
      this.formData.set({ title: '', response: '' });
      this.editingId.set(null);
      this.mode.set('form');
    } else {
      this.mode.set('list');
    }
  }

  /**
   * Abre el formulario en modo edición
   */
  onEdit(response: AutomaticReply): void {
    this.editingId.set(response.responseId);
    this.formData.set({
      title: response.title,
      response: response.response
    });
    this.mode.set('form');
  }

  /**
   * Guarda (crear o actualizar) una respuesta
   */
  submit(): void {
    if (!this.canSubmit()) return;

    this.isSubmitting.set(true);
    const data = this.formData();
    const payload = {
      title: data.title.trim(),
      response: data.response.trim(),
      active: true
    };

    const operation = this.isEditMode()
      ? this.automaticReplyService.updateAutomaticReply(this.editingId()!, payload)
      : this.automaticReplyService.createAutomaticReply(payload);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.isEditMode()
            ? 'Respuesta actualizada correctamente'
            : 'Respuesta creada correctamente'
        });
        this.loadResponses();
        this.mode.set('list');
        this.isSubmitting.set(false);
      },
      error: (error) => {
        console.error('Error al guardar respuesta:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar la respuesta'
        });
        this.isSubmitting.set(false);
      }
    });
  }

  /**
   * Cancela el formulario
   */
  cancelForm(): void {
    this.mode.set('list');
    this.formData.set({ title: '', response: '' });
    this.editingId.set(null);
  }

  /**
   * Elimina una respuesta con confirmación
   */
  onDelete(response: AutomaticReply, event: Event): void {
    event.stopPropagation();

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Estás seguro de eliminar la respuesta "${response.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.automaticReplyService.deleteAutomaticReply(response.responseId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Respuesta eliminada correctamente'
            });
            this.loadResponses();
          },
          error: (error) => {
            console.error('Error al eliminar respuesta:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar la respuesta'
            });
          }
        });
      }
    });
  }

  /**
   * Genera items del menú contextual
   */
  getMenuItems(response: AutomaticReply): MenuItem[] {
    return [
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.onEdit(response)
      },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        command: (event) => this.onDelete(response, event.originalEvent!)
      }
    ];
  }

  /**
   * Cierra el dialog
   */
  close(): void {
    this.dialogRef.close();
  }
}
