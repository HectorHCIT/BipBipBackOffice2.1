import { Component, ChangeDetectionStrategy, signal, input, output, inject, OnInit, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';

import { FaqService } from '../../services/faq.service';
import { FaqDetail, FaqPayload } from '../../models';

@Component({
  selector: 'app-faq-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DrawerModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    ToggleSwitchModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './faq-form.component.html'
})
export class FaqFormComponent implements OnInit {
  readonly visible = input.required<boolean>();
  readonly faqId = input<number | null>(null);
  readonly visibleChange = output<boolean>();
  readonly onSave = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly faqService = inject(FaqService);
  private readonly messageService = inject(MessageService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isEditMode = signal(false);

  visibleModel = false;
  faqForm!: FormGroup;

  constructor() {
    this.initForm();

    effect(() => {
      const isVisible = this.visible();
      const id = this.faqId();

      untracked(() => {
        this.visibleModel = isVisible;

        if (isVisible && id) {
          this.isEditMode.set(true);
          this.loadFaqData(id);
        } else if (isVisible && !id) {
          this.isEditMode.set(false);
          this.resetForm();
        }
      });
    });
  }

  ngOnInit(): void {
    // Additional initialization if needed
  }

  private initForm(): void {
    this.faqForm = this.fb.group({
      isActive: [false],
      titleFaq: ['', [Validators.required, Validators.maxLength(500)]],
      descFaq: ['', [Validators.required, Validators.maxLength(2000)]]
    });
  }

  private loadFaqData(idFaq: number): void {
    this.isLoading.set(true);

    this.faqService.getFaqById(idFaq).subscribe({
      next: (faq) => {
        this.patchFormWithFaq(faq);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading FAQ:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la pregunta frecuente'
        });
        this.isLoading.set(false);
      }
    });
  }

  private patchFormWithFaq(faq: FaqDetail): void {
    this.faqForm.patchValue({
      isActive: faq.isActive,
      titleFaq: faq.faq,
      descFaq: faq.description
    });
  }

  private resetForm(): void {
    this.faqForm.reset({
      isActive: false,
      titleFaq: '',
      descFaq: ''
    });
  }

  onSubmit(): void {
    if (this.faqForm.invalid) {
      this.faqForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor completa todos los campos requeridos'
      });
      return;
    }

    this.isSaving.set(true);

    const payload: FaqPayload = this.faqForm.value;

    const request$ = this.isEditMode()
      ? this.faqService.editFaq(this.faqId()!, payload)
      : this.faqService.createFaq(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.isEditMode()
            ? 'Pregunta actualizada correctamente'
            : 'Pregunta creada correctamente'
        });
        this.isSaving.set(false);
        this.closeDrawer();
        this.onSave.emit();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.isEditMode()
            ? 'No se pudo actualizar la pregunta'
            : 'No se pudo crear la pregunta'
        });
        console.error('Error saving FAQ:', error);
        this.isSaving.set(false);
      }
    });
  }

  closeDrawer(): void {
    this.visibleModel = false;
    this.visibleChange.emit(false);
    this.resetForm();
  }

  onVisibleChange(visible: boolean): void {
    this.visibleModel = visible;
    this.visibleChange.emit(visible);
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.faqForm.get(controlName);
    return !!(control && control.hasError(errorName) && (control.dirty || control.touched));
  }

  getFormTitle(): string {
    return this.isEditMode() ? 'Editar Pregunta Frecuente' : 'Nueva Pregunta Frecuente';
  }

  getButtonLabel(): string {
    return this.isEditMode() ? 'Guardar Cambios' : 'Crear Pregunta';
  }
}
