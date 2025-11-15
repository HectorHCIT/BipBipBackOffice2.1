import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { PaginatorModule } from 'primeng/paginator';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem, MessageService } from 'primeng/api';

import { AgentHistoryService } from '../../services';
import { AgentStatusEvent, AgentStatus } from '../../models';

@Component({
  selector: 'app-agent-history-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    ProgressSpinnerModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    PaginatorModule,
    BreadcrumbModule
  ],
  providers: [MessageService],
  templateUrl: './agent-history-page.component.html',
  styleUrls: ['./agent-history-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentHistoryPageComponent implements OnInit {
  private readonly agentHistoryService = inject(AgentHistoryService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  // Expose Math for template
  readonly Math = Math;

  // Breadcrumb
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'SAC', routerLink: '/sac' },
    { label: 'Chats' },
    { label: 'Historial de Agentes' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Data para la tabla
  dataSource: AgentStatusEvent[] = [];

  // Datos originales (sin filtrar local)
  private readonly originalData = signal<AgentStatusEvent[]>([]);

  // Datos filtrados (para mostrar en tabla)
  private readonly filteredData = signal<AgentStatusEvent[]>([]);

  // State signals
  readonly loading = signal(false);
  readonly showFilters = signal(false);

  // Paginación
  pageIndex = 0;
  readonly pageSize = signal(5);
  totalRecords = 0;

  // Opciones de paginación
  listPages = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '25', value: 25 }
  ];

  // Computed signals
  readonly hasEvents = computed(() => this.filteredData().length > 0 || this.originalData().length > 0);
  readonly isFiltering = computed(() => {
    const values = this.filterForm?.value;
    return values?.agentName || values?.status !== 'all' || values?.dateRange;
  });

  readonly dateRange = computed(() => {
    return this.filterForm?.value?.dateRange || null;
  });

  readonly fromDate = computed(() => {
    const range = this.dateRange();
    return (range && Array.isArray(range) && range[0]) ? range[0] : null;
  });

  readonly toDate = computed(() => {
    const range = this.dateRange();
    return (range && Array.isArray(range) && range[1]) ? range[1] : null;
  });

  // Formulario de filtros
  filterForm!: FormGroup;

  // Columnas de la tabla
  displayedColumns = ['agentName', 'username', 'status', 'changedAt', 'changedBy'];

  // Breadcrumb
  breadcrumbs = [
    { label: 'SAC', link: '/sac' },
    { label: 'Chats', link: '/sac/chats' },
    { label: 'Historial de Agentes', link: '' }
  ];

  // Opciones de status para filtro
  statusOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Online', value: 'online' },
    { label: 'Offline', value: 'offline' },
    { label: 'Break', value: 'break' }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.loadTodayHistory();
  }

  /**
   * Inicializa el formulario de filtros
   */
  private initializeForm(): void {
    this.filterForm = this.fb.group({
      dateRange: [null],
      agentName: [''],
      status: ['all']
    });
  }

  /**
   * Carga el historial del día actual
   */
  private loadTodayHistory(): void {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // PrimeNG DatePicker espera un array [startDate, endDate] para selectionMode="range"
    this.filterForm.patchValue({
      dateRange: [startOfDay, endOfDay]
    });

    this.loadHistory(startOfDay, endOfDay);
  }

  /**
   * Carga el historial de cambios de estado
   */
  private loadHistory(startDate: Date, endDate: Date): void {
    this.loading.set(true);

    this.agentHistoryService.getAgentStatusHistory(startDate, endDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.originalData.set(response.events);
          this.applyLocalFilters();
          this.totalRecords = this.filteredData().length;

          this.loading.set(false);
          this.cdr.markForCheck();

          if (response.events.length === 0) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Sin datos',
              detail: 'No se encontraron eventos en el rango de fechas seleccionado'
            });
          }
        },
        error: (error) => {
          console.error('[AgentHistory] Error:', error);
          this.loading.set(false);
          this.cdr.markForCheck();

          this.messageService.add({
            severity: 'error',
            summary: 'Error al cargar el historial',
            detail: 'No se pudo obtener el historial de agentes. Por favor, intenta de nuevo.'
          });
        }
      });
  }

  /**
   * Aplica filtros locales sobre los datos cargados
   */
  private applyLocalFilters(): void {
    const formValues = this.filterForm.value;

    let filtered = [...this.originalData()];

    // Filtrar por nombre del agente
    if (formValues.agentName) {
      const searchTerm = formValues.agentName.toLowerCase();
      filtered = filtered.filter(event =>
        event.agentName.toLowerCase().includes(searchTerm) ||
        event.agentUsername.toLowerCase().includes(searchTerm)
      );
    }

    // Filtrar por status
    if (formValues.status && formValues.status !== 'all') {
      filtered = filtered.filter(event => event.status === formValues.status);
    }

    this.filteredData.set(filtered);
    this.updateTableData();
  }

  /**
   * Actualiza los datos de la tabla con paginación
   */
  updateTableData(): void {
    const startIndex = this.pageIndex * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    this.dataSource = this.filteredData().slice(startIndex, endIndex);
    this.totalRecords = this.filteredData().length;
    this.cdr.markForCheck();
  }

  /**
   * Aplica los filtros del formulario
   */
  applyFilters(): void {
    const dateRange = this.filterForm.value.dateRange;

    // PrimeNG DatePicker devuelve un array [startDate, endDate] o null
    if (!dateRange || !Array.isArray(dateRange) || dateRange.length < 2 || !dateRange[0] || !dateRange[1]) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Rango de fechas requerido',
        detail: 'Por favor selecciona un rango de fechas'
      });
      return;
    }

    const startDate = new Date(dateRange[0]);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateRange[1]);
    endDate.setHours(23, 59, 59, 999);

    this.loadHistory(startDate, endDate);
  }

  /**
   * Limpia los filtros y recarga datos del día
   */
  clearFilters(): void {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    this.filterForm.patchValue({
      dateRange: [startOfDay, endOfDay],
      agentName: '',
      status: 'all'
    });

    this.pageIndex = 0;
    this.loadHistory(startOfDay, endOfDay);
    this.messageService.add({
      severity: 'success',
      summary: 'Filtros limpiados',
      detail: 'Se han restaurado los filtros predeterminados'
    });
  }

  /**
   * Refresca los datos
   */
  refreshData(): void {
    const dateRange = this.filterForm.value.dateRange;

    if (dateRange && Array.isArray(dateRange) && dateRange[0] && dateRange[1]) {
      const startDate = new Date(dateRange[0]);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(dateRange[1]);
      endDate.setHours(23, 59, 59, 999);

      this.agentHistoryService.clearCache();
      this.loadHistory(startDate, endDate);
    } else {
      this.loadTodayHistory();
    }
  }

  /**
   * Toggle panel de filtros
   */
  toggleFiltersPanel(): void {
    this.showFilters.set(!this.showFilters());
  }

  /**
   * Maneja el cambio de página del paginator
   */
  onPaginateChange(event: any): void {
    // p-paginator event tiene: { first, rows, page, pageCount }
    this.pageIndex = event.page;
    this.pageSize.set(event.rows);
    this.updateTableData();
  }

  /**
   * Retorna la clase CSS para el badge de status
   */
  getStatusBadgeClass(status: AgentStatus): string {
    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold';

    switch (status) {
      case 'online':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'offline':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'break':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`;
    }
  }

  /**
   * Formatea una fecha para mostrar
   */
  formatDate(date: Date): string {
    if (!date) return 'N/A';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    return new Intl.DateTimeFormat('es-HN', options).format(date);
  }

  /**
   * Maneja el cambio en los filtros locales
   */
  onLocalFilterChange(): void {
    this.pageIndex = 0;
    this.applyLocalFilters();
  }
}
