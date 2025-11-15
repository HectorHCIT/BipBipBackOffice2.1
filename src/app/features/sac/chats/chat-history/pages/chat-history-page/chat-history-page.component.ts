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
import { DrawerModule } from 'primeng/drawer';

import { ChatHistoryService } from '../../services';
import { ChatHistoryRecord } from '../../models';
import { ChatPreviewComponent } from '../../components/chat-preview';

@Component({
  selector: 'app-chat-history-page',
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
    BreadcrumbModule,
    DrawerModule,
    ChatPreviewComponent
  ],
  providers: [MessageService],
  templateUrl: './chat-history-page.component.html',
  styleUrls: ['./chat-history-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatHistoryPageComponent implements OnInit {
  private readonly chatHistoryService = inject(ChatHistoryService);
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
    { label: 'Historial de Chats' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Data para la tabla
  dataSource: ChatHistoryRecord[] = [];

  // Datos originales (sin filtrar)
  private readonly originalData = signal<ChatHistoryRecord[]>([]);

  // Datos filtrados
  private readonly filteredData = signal<ChatHistoryRecord[]>([]);

  // State signals
  readonly selectedChat = signal<ChatHistoryRecord | null>(null);
  readonly loading = signal(false);
  readonly showFilters = signal(false);
  readonly showDrawer = signal(false);
  readonly dateFilterType = signal<'range' | 'single'>('range');

  // Paginación
  pageIndex = 0;
  readonly pageSize = signal(10);
  totalRecords = 0;

  // Opciones de paginación
  listPages = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 }
  ];

  // Computed signals
  readonly hasChats = computed(() => this.filteredData().length > 0 || this.originalData().length > 0);
  readonly isFiltering = computed(() => {
    const values = this.filterForm?.value;
    return values?.searchText || values?.customerPhone || values?.dateRange || values?.singleDate;
  });

  readonly dateRange = computed(() => {
    return this.filterForm?.value?.dateRange || null;
  });

  readonly singleDate = computed(() => {
    return this.filterForm?.value?.singleDate || null;
  });

  // Formulario de filtros
  filterForm!: FormGroup;

  // Opciones para dropdowns
  chatTypeOptions = [
    { label: 'Todos', value: null },
    { label: 'SAC - Cliente', value: 'SC' },
    { label: 'SAC - Driver', value: 'SD' }
  ];

  // Columnas para la tabla
  displayedColumns = ['tipo', 'orderId', 'agentName', 'messages', 'duration', 'assignedAt', 'actions'];

  ngOnInit(): void {
    this.initializeForm();
    this.loadChatHistoryLast7Days();
  }

  /**
   * Convierte una fecha a formato ISO local
   */
  private toLocalISOString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ms = String(date.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}Z`;
  }

  /**
   * Carga el historial de los últimos 7 días por defecto
   */
  private loadChatHistoryLast7Days(): void {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    this.loadChatHistory({
      from: this.toLocalISOString(sevenDaysAgo),
      to: this.toLocalISOString(today)
    });
  }

  /**
   * Inicializa el formulario de filtros
   */
  private initializeForm(): void {
    this.filterForm = this.fb.group({
      searchText: [''],
      customerPhone: [''],
      dateRange: [null],
      singleDate: [null]
    });
  }

  /**
   * Carga el historial de chats desde el servicio
   */
  loadChatHistory(filters?: any): void {
    this.loading.set(true);

    const backendFilters: any = {};

    if (filters?.customerPhone) {
      backendFilters.customerPhone = filters.customerPhone;
    }

    if (filters?.singleDate) {
      backendFilters.createdAtDate = filters.singleDate instanceof Date
        ? this.toLocalISOString(filters.singleDate)
        : filters.singleDate;
    } else if (filters?.dateRange) {
      const range = filters.dateRange;
      // PrimeNG DatePicker devuelve un array [startDate, endDate]
      if (Array.isArray(range) && range.length >= 2) {
        if (range[0]) {
          const startDate = range[0] instanceof Date ? range[0] : new Date(range[0]);
          startDate.setHours(0, 0, 0, 0);
          backendFilters.from = this.toLocalISOString(startDate);
        }
        if (range[1]) {
          const endDate = range[1] instanceof Date ? range[1] : new Date(range[1]);
          endDate.setHours(23, 59, 59, 999);
          backendFilters.to = this.toLocalISOString(endDate);
        }
      }
    }

    if (filters?.from && !backendFilters.from && !backendFilters.createdAtDate) {
      backendFilters.from = filters.from instanceof Date
        ? this.toLocalISOString(filters.from)
        : filters.from;
    }
    if (filters?.to && !backendFilters.to && !backendFilters.createdAtDate) {
      backendFilters.to = filters.to instanceof Date
        ? this.toLocalISOString(filters.to)
        : filters.to;
    }

    this.chatHistoryService.getChatHistory(backendFilters)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: ChatHistoryRecord[]) => {

          this.originalData.set(data);
          this.applyLocalFilters();
          this.totalRecords = this.filteredData().length;

          this.loading.set(false);
          this.cdr.markForCheck();

          if (data.length === 0) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Sin datos',
              detail: 'No se encontraron chats en el rango de fechas seleccionado'
            });
          }
        },
        error: (error: any) => {
          console.error('[ChatHistory] Error cargando historial:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el historial de chats'
          });
          this.loading.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Aplica filtros locales sobre los datos cargados
   */
  private applyLocalFilters(): void {
    const filters = this.filterForm.value;
    let filtered = [...this.originalData()];

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(chat =>
        chat.userChat?.toLowerCase().includes(searchLower) ||
        chat.orderId?.toString().includes(searchLower) ||
        chat.idCustomer?.toString().includes(searchLower) ||
        chat.tipoChat?.toLowerCase().includes(searchLower)
      );
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
    const filters = this.filterForm.value;

    if (filters.customerPhone || filters.dateRange || filters.singleDate) {
      this.loadChatHistory(filters);
      return;
    }

    this.pageIndex = 0;
    this.applyLocalFilters();
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.filterForm.patchValue({
      searchText: '',
      customerPhone: '',
      dateRange: null,
      singleDate: null
    });

    this.dateFilterType.set('range');
    this.pageIndex = 0;

    this.loadChatHistoryLast7Days();

    this.messageService.add({
      severity: 'success',
      summary: 'Filtros limpiados',
      detail: 'Se han restaurado los filtros predeterminados'
    });
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
   * Muestra la vista previa del chat en el drawer
   */
  viewChat(chat: ChatHistoryRecord): void {
    this.selectedChat.set(chat);
    this.showDrawer.set(true);
    this.cdr.markForCheck();
  }

  /**
   * Cierra el drawer
   */
  closeDrawer(): void {
    this.showDrawer.set(false);
    this.selectedChat.set(null);
    this.cdr.markForCheck();
  }

  /**
   * Exporta el historial
   */
  exportData(): void {
    this.loading.set(true);

    this.chatHistoryService.exportChatHistory(this.filteredData())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `chat-history-${new Date().toISOString().split('T')[0]}.csv`;
          link.click();
          window.URL.revokeObjectURL(url);

          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Historial exportado exitosamente'
          });
          this.loading.set(false);
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          console.error('[ChatHistory] Error exportando:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo exportar el historial'
          });
          this.loading.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Refresca los datos
   */
  refreshData(): void {
    const filters = this.filterForm.value;

    if (filters.dateRange || filters.customerPhone) {
      this.loadChatHistory(filters);
    } else {
      this.loadChatHistoryLast7Days();
    }
  }

  /**
   * Toggle panel de filtros
   */
  toggleFiltersPanel(): void {
    this.showFilters.set(!this.showFilters());
    this.cdr.markForCheck();
  }

  /**
   * Establece el tipo de filtro de fecha
   */
  setDateFilterType(type: 'range' | 'single'): void {
    this.dateFilterType.set(type);

    if (type === 'range') {
      this.filterForm.patchValue({ singleDate: null });
    } else {
      this.filterForm.patchValue({ dateRange: null });
    }

    this.cdr.markForCheck();
  }

  /**
   * Obtiene el severity del tag según el tipo de chat
   */
  getChatTypeSeverity(type: string): 'info' | 'success' | 'warn' | 'secondary' {
    switch (type) {
      case 'SC':
        return 'info';
      case 'SD':
        return 'success';
      case 'help':
        return 'warn';
      case 'order':
        return 'secondary';
      default:
        return 'info';
    }
  }

  /**
   * Obtiene el label del tipo de chat
   */
  getChatTypeLabel(type: string): string {
    switch (type) {
      case 'SC':
        return 'SAC - Cliente';
      case 'SD':
        return 'SAC - Driver';
      case 'help':
        return 'Asistencia';
      case 'order':
        return 'Orden';
      default:
        return type;
    }
  }

  /**
   * Formatea la fecha para mostrar
   */
  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleString('es-HN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Cuenta los mensajes de un chat
   */
  getMessageCount(chat: ChatHistoryRecord): number {
    return chat.chat?.length || 0;
  }

  /**
   * Maneja el cambio local de filtros
   */
  onLocalFilterChange(): void {
    this.pageIndex = 0;
    this.applyLocalFilters();
  }
}
