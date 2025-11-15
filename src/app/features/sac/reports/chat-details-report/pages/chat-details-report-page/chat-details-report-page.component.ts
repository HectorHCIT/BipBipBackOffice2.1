import { Component, OnInit, signal, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MenuItem, MessageService } from 'primeng/api';

// Services & Models
import { ChatDetailsReportService } from '../../services';
import { ChatDetailsReportParams, Agentes } from '../../../shared/models';
import {
  downloadPDFFromBase64,
  generateReportFilename,
  formatDateISO
} from '../../../shared/utils';

@Component({
  selector: 'app-chat-details-report-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    BreadcrumbModule,
    CardModule,
    ToastModule,
    InputTextModule,
    CheckboxModule
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat-details-report-page.component.html',
  styleUrl: './chat-details-report-page.component.scss'
})
export class ChatDetailsReportPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(ChatDetailsReportService);
  private readonly messageService = inject(MessageService);

  // Breadcrumb
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'SAC', routerLink: '/sac' },
    { label: 'Reportes', routerLink: '/sac/reportes' },
    { label: 'Detalle de Chats' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Signals
  readonly isLoading = signal(false);
  readonly maxDate = new Date();
  readonly agentList = signal<Agentes[]>([]);
  readonly filteredAgents = signal<Agentes[]>([]);
  readonly searchTerm = signal('');

  // Estado del formulario
  readonly selectedAgent = signal<Agentes | null>(null);
  readonly allAgentsChecked = signal(false);

  // Computed: input deshabilitado cuando "Todos" está marcado
  readonly isInputDisabled = computed(() => this.allAgentsChecked());

  // Computed: botón habilitado cuando hay agente seleccionado O "Todos" marcado
  readonly isButtonEnabled = computed(() =>
    this.selectedAgent() !== null || this.allAgentsChecked()
  );

  // Form
  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadAgents();
    this.setupFormListeners();
  }

  /**
   * Inicializa el formulario con validaciones
   */
  private initForm(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.form = this.fb.group({
      dateRange: [[thirtyDaysAgo, today], [Validators.required]],
      agentSearch: [''],
      allAgents: [false]
    });
  }

  /**
   * Configura listeners del formulario
   */
  private setupFormListeners(): void {
    // Listener para el checkbox "Todos"
    this.form.get('allAgents')?.valueChanges.subscribe((checked: boolean) => {
      this.allAgentsChecked.set(checked);

      if (checked) {
        // Limpiar búsqueda y agente seleccionado
        this.form.get('agentSearch')?.setValue('', { emitEvent: false });
        this.selectedAgent.set(null);
        this.filteredAgents.set([]);
        this.searchTerm.set('');
      }
    });
  }

  /**
   * Carga la lista de agentes
   */
  private loadAgents(): void {
    this.reportService.getAgents().subscribe({
      next: (agents) => {
        this.agentList.set(agents || []);
      },
      error: (error) => {
        console.error('Error al cargar agentes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la lista de agentes'
        });
      }
    });
  }

  /**
   * Filtra agentes según el término de búsqueda
   */
  filterAgents(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchValue = input.value.trim();
    this.searchTerm.set(searchValue);

    if (searchValue === '') {
      this.filteredAgents.set([]);
      return;
    }

    // Filtrado case-insensitive
    const filtered = this.agentList().filter(agent =>
      agent.agentName.toLowerCase().includes(searchValue.toLowerCase())
    );

    this.filteredAgents.set(filtered);
  }

  /**
   * Selecciona un agente de la lista filtrada
   */
  selectAgent(agent: Agentes): void {
    this.selectedAgent.set(agent);
    this.form.get('agentSearch')?.setValue(agent.agentName, { emitEvent: false });
    this.filteredAgents.set([]);
  }

  /**
   * Genera y descarga el reporte
   */
  generateReport(): void {
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Por favor selecciona un rango de fechas válido'
      });
      return;
    }

    if (!this.isButtonEnabled()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Debes seleccionar un agente o marcar "Todos los agentes"'
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

    const [startDate, endDate] = dateRange;

    // Determinar el parámetro nameUser
    const nameUser = this.allAgentsChecked()
      ? 'TODOS'
      : this.selectedAgent()?.agentName || '';

    const params: ChatDetailsReportParams = {
      fechaInicio: formatDateISO(startDate),
      fechaFinal: formatDateISO(endDate),
      nameUser
    };

    this.isLoading.set(true);

    this.reportService.generateReport(params).subscribe({
      next: (response) => {

        try {
          const base64 = response.data || response;

          if (!base64) {
            throw new Error('No se recibió el archivo del servidor');
          }

          const agentLabel = this.allAgentsChecked() ? 'TODOS' : this.selectedAgent()?.agentName || 'Sin-Agente';
          const filename = `Reporte detalle de chats ${agentLabel} (${formatDateISO(startDate)} - ${formatDateISO(endDate)})`;

          downloadPDFFromBase64(base64, filename);

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
        console.error('❌ [CHAT-DETAILS-REPORT] Error:', error);
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
      dateRange: [thirtyDaysAgo, today],
      agentSearch: '',
      allAgents: false
    });

    this.selectedAgent.set(null);
    this.filteredAgents.set([]);
    this.searchTerm.set('');
    this.allAgentsChecked.set(false);
  }
}
