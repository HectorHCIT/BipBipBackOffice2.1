import { Component, OnInit, input, output, signal, inject, ChangeDetectionStrategy, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Models & Services
import { EditOccurrenceDto } from '../../models';
import { OccurrenceService } from '../../services';

@Component({
  selector: 'app-edit-occurrence-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    ToastModule
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-occurrence-dialog.component.html',
  styleUrl: './edit-occurrence-dialog.component.scss'
})
export class EditOccurrenceDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly occurrenceService = inject(OccurrenceService);
  private readonly messageService = inject(MessageService);

  // Inputs
  readonly visible = input.required<boolean>();
  readonly occurrenceId = input.required<number>();

  // Outputs
  readonly onClose = output<void>();
  readonly onSave = output<void>();

  // Local signals
  readonly isSaving = signal(false);
  readonly characterCount = signal(0);

  // Form
  form!: FormGroup;

  // Constants
  readonly MAX_CHARS = 200;

  // Computed
  readonly remainingChars = computed(() => this.MAX_CHARS - this.characterCount());
  readonly isOverLimit = computed(() => this.characterCount() > this.MAX_CHARS);

  constructor() {
    // Effect para resetear el formulario cuando cambia la visibilidad
    effect(() => {
      if (this.visible()) {
        this.resetForm();
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Inicializa el formulario reactivo
   */
  private initForm(): void {
    this.form = this.fb.group({
      solution: ['', [Validators.required, Validators.maxLength(this.MAX_CHARS)]],
      attendance: ['', [Validators.required, Validators.maxLength(100)]]
    });

    // Observar cambios en el textarea para contar caracteres
    this.form.get('solution')?.valueChanges.subscribe((value: string) => {
      this.characterCount.set(value?.length || 0);
    });
  }

  /**
   * Resetea el formulario
   */
  private resetForm(): void {
    this.form?.reset();
    this.characterCount.set(0);
    this.isSaving.set(false);
  }

  /**
   * Cierra el diálogo
   */
  close(): void {
    this.onClose.emit();
  }

  /**
   * Guarda la solución
   */
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor completa todos los campos requeridos'
      });
      return;
    }

    if (this.isOverLimit()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Texto muy largo',
        detail: `La solución no puede exceder ${this.MAX_CHARS} caracteres`
      });
      return;
    }

    const dto: EditOccurrenceDto = {
      codIncident: this.occurrenceId(),
      solution: this.form.value.solution.trim(),
      attendance: this.form.value.attendance.trim()
    };

    this.isSaving.set(true);

    this.occurrenceService.addSolution(dto).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.onSave.emit();
      },
      error: (error) => {
        console.error('Error al guardar la solución:', error);
        this.isSaving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar la solución'
        });
      }
    });
  }

  /**
   * Obtiene el estilo del contador de caracteres
   */
  getCounterClass(): string {
    if (this.isOverLimit()) {
      return 'text-red-600 font-semibold';
    } else if (this.remainingChars() < 20) {
      return 'text-orange-600';
    }
    return 'text-gray-600';
  }
}
