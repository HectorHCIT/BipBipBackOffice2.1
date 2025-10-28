import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';

// Models & Services
import { InvoiceDetail } from '../../models/invoice.model';
import { InvoiceService } from '../../services/invoice.service';

/**
 * InvoiceDetailComponent - Vista de detalle de una factura
 *
 * Features:
 * - Muestra toda la información de la factura (read-only)
 * - Descarga PDF si está disponible
 * - Formateo de montos, fechas y horas
 * - Navegación de regreso a lista
 */
@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    DividerModule,
    ToastModule
  ],
  templateUrl: './invoice-detail.component.html',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly invoiceService = inject(InvoiceService);
  private readonly messageService = inject(MessageService);

  readonly invoiceDetail = signal<InvoiceDetail | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly invoiceId = signal<number>(0);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.invoiceId.set(Number(id));
        this.loadInvoiceDetail(Number(id));
      }
    });
  }

  /**
   * Carga el detalle completo de la factura
   */
  loadInvoiceDetail(id: number): void {
    this.isLoading.set(true);

    this.invoiceService.getInvoiceById(id).subscribe({
      next: (detail) => {
        this.invoiceDetail.set(detail);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading invoice detail:', error);
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el detalle de la factura'
        });
        // Regresar a la lista después de un error
        setTimeout(() => this.backToList(), 2000);
      }
    });
  }

  /**
   * Descarga el PDF de la factura
   */
  downloadInvoicePDF(): void {
    const detail = this.invoiceDetail();
    if (detail?.invoiceUrl) {
      window.open(detail.invoiceUrl, '_blank');
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'No hay PDF disponible para esta factura'
      });
    }
  }

  /**
   * Regresa a la lista de facturas
   */
  backToList(): void {
    this.router.navigate(['/accounting/invoices']);
  }

  /**
   * Formatea hora de 24hrs (HH:MM:SS) a 12hrs con AM/PM
   */
  formatHour(hourString: string | undefined): string {
    if (!hourString) return '--:--:-- --';

    const [hours, minutes, seconds] = hourString.split(':').map(Number);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convierte 0 en 12
    return `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${suffix}`;
  }

  /**
   * Formatea fecha para mostrar
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formatea fecha y hora
   */
  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('es-HN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formatea monto en Lempiras
   */
  formatCurrency(amount: number): string {
    return `L ${amount.toFixed(2)}`;
  }
}
