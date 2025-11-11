import { Component, OnInit, signal, inject, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';

// Components
import { ChatReportModalComponent } from '../../components/chat-report-modal/chat-report-modal.component';

// Services & Models
import { ChatReportService } from '../../services';
import { environment } from '../../../../../../../environments/environment';
import {
  downloadPDFFromBase64,
  downloadExcelLegacyFromBase64,
  formatDateForReportService,
  formatDateISO
} from '../../../shared/utils';

/**
 * Interface para formato seleccionado en el modal
 */
interface ReportFormat {
  id: number;
  label: string;
  format: 'pdf' | 'xls';
  reportType: number; // 1 = por Fecha, 2 = por Usuario
}

@Component({
  selector: 'app-chat-report-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    BreadcrumbModule,
    CardModule,
    ToastModule,
    ChatReportModalComponent
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat-report-page.component.html',
  styleUrl: './chat-report-page.component.scss'
})
export class ChatReportPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(ChatReportService);
  private readonly messageService = inject(MessageService);

  // ViewChild para el modal
  readonly modal = viewChild.required<ChatReportModalComponent>('modal');

  // Breadcrumb
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'SAC', routerLink: '/sac' },
    { label: 'Reportes', routerLink: '/sac/reportes' },
    { label: 'Reporte de Chats' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Signals
  readonly isLoading = signal(false);
  readonly maxDate = new Date();

  // Endpoints para los tipos de reporte
  private readonly endpoints = {
    1: 'reporteChatXFecha',   // Por Fecha
    2: 'reporteChatXUsuario'  // Por Usuario
  };

  // Form
  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Inicializa el formulario con validaciones
   */
  private initForm(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.form = this.fb.group({
      dateRange: [[thirtyDaysAgo, today], [Validators.required]]
    });
  }

  /**
   * Abre el modal para seleccionar tipo y formato
   */
  openReportModal(): void {
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Por favor selecciona un rango de fechas válido'
      });
      return;
    }

    const dateRange: Date[] = this.form.value.dateRange;
    if (!dateRange || dateRange.length !== 2) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Debes seleccionar fecha de inicio y fin'
      });
      return;
    }

    this.modal().open();
  }

  /**
   * Maneja la selección de formato desde el modal
   */
  onFormatSelected(format: ReportFormat): void {
    const dateRange: Date[] = this.form.value.dateRange;
    const [startDate, endDate] = dateRange;

    // Construir URL según el tipo de reporte y formato
    const endpoint = this.endpoints[format.reportType as keyof typeof this.endpoints];
    const formatNumber = format.format === 'pdf' ? 1 : 2;

    const fechaInicio = formatDateForReportService(startDate);
    const fechaFinal = formatDateForReportService(endDate);

    const url = `${environment.apiURLReports}reporteria/${endpoint}/${fechaInicio}/${fechaFinal}/${formatNumber}`;

    this.isLoading.set(true);

    this.reportService.generateReport(url).subscribe({
      next: (response) => {
        try {
          const base64 = response;

          if (!base64) {
            throw new Error('No se recibió el archivo del servidor');
          }

          const reportTypeLabel = format.reportType === 1 ? 'Por Fecha' : 'Por Usuario';
          const filename = `Reporte de Chats ${reportTypeLabel} (${formatDateISO(startDate)} - ${formatDateISO(endDate)})`;

          // Descargar según formato
          if (format.format === 'pdf') {
            downloadPDFFromBase64(base64, filename);
          } else {
            downloadExcelLegacyFromBase64(base64, filename);
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Reporte descargado correctamente'
          });
        } catch (error) {
          console.error('Error al procesar el reporte:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo procesar el archivo descargado'
          });
        } finally {
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        console.error('❌ [CHAT-REPORT] Error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo generar el reporte'
        });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Limpia el formulario
   */
  clearForm(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.form.patchValue({
      dateRange: [thirtyDaysAgo, today]
    });
  }
}
