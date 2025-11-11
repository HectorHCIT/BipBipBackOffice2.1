import { Component, output, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

/**
 * Tipos de reporte de chat
 */
interface ReportType {
  id: number;
  label: string;
  endpoint: string;
}

/**
 * Formatos de archivo
 */
interface ReportFormat {
  id: number;
  label: string;
  format: 'pdf' | 'xls';
  reportType: number; // 1 = por Fecha, 2 = por Usuario
}

@Component({
  selector: 'app-chat-report-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    SelectModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat-report-modal.component.html',
  styleUrl: './chat-report-modal.component.scss'
})
export class ChatReportModalComponent {
  private readonly fb = inject(FormBuilder);

  // Output events
  readonly formatSelected = output<ReportFormat>();
  readonly cancelled = output<void>();

  // Signals
  readonly visible = signal(false);
  readonly selectedType = signal<number | null>(null);

  // Tipos de reporte
  readonly reportTypes: ReportType[] = [
    { id: 1, label: 'Reporte por Fecha', endpoint: 'reporteChatXFecha' },
    { id: 2, label: 'Reporte por Usuario', endpoint: 'reporteChatXUsuario' }
  ];

  // Formatos disponibles (4 combinaciones)
  private readonly allFormats: ReportFormat[] = [
    { id: 1, label: 'PDF - Por Fecha', format: 'pdf', reportType: 1 },
    { id: 2, label: 'Excel - Por Fecha', format: 'xls', reportType: 1 },
    { id: 3, label: 'PDF - Por Usuario', format: 'pdf', reportType: 2 },
    { id: 4, label: 'Excel - Por Usuario', format: 'xls', reportType: 2 }
  ];

  // Formatos filtrados según tipo seleccionado
  readonly availableFormats = computed(() => {
    const typeId = this.selectedType();
    if (!typeId) return [];

    return this.allFormats.filter(f => f.reportType === typeId);
  });

  // Form
  form!: FormGroup;

  constructor() {
    this.initForm();
    this.setupFormListeners();
  }

  /**
   * Inicializa el formulario
   */
  private initForm(): void {
    this.form = this.fb.group({
      reportType: [null, [Validators.required]],
      format: [{ value: null, disabled: true }, [Validators.required]]
    });
  }

  /**
   * Configura listeners del formulario
   */
  private setupFormListeners(): void {
    // Cuando cambia el tipo, resetear formato y actualizar signal
    this.form.get('reportType')?.valueChanges.subscribe((typeId: number | null) => {
      this.selectedType.set(typeId);
      this.form.get('format')?.setValue(null);

      // Habilitar/deshabilitar el control de formato según si hay tipo seleccionado
      const formatControl = this.form.get('format');
      if (typeId) {
        formatControl?.enable();
      } else {
        formatControl?.disable();
      }
    });
  }

  /**
   * Abre el modal
   */
  open(): void {
    this.visible.set(true);
    this.form.reset();
    this.selectedType.set(null);
  }

  /**
   * Cierra el modal
   */
  close(): void {
    this.visible.set(false);
    this.form.reset();
    this.selectedType.set(null);
    // Deshabilitar el control de formato al cerrar
    this.form.get('format')?.disable();
  }

  /**
   * Maneja la confirmación
   */
  confirm(): void {
    if (this.form.invalid) {
      return;
    }

    const selectedFormatId = this.form.value.format;
    const format = this.allFormats.find(f => f.id === selectedFormatId);

    if (format) {
      this.formatSelected.emit(format);
      this.close();
    }
  }

  /**
   * Maneja la cancelación
   */
  cancel(): void {
    this.cancelled.emit();
    this.close();
  }

  /**
   * Obtiene el endpoint del tipo seleccionado
   */
  getSelectedEndpoint(): string | null {
    const typeId = this.selectedType();
    if (!typeId) return null;

    const type = this.reportTypes.find(t => t.id === typeId);
    return type?.endpoint || null;
  }
}
