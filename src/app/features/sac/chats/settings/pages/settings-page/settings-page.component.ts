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
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Timestamp } from '@angular/fire/firestore';

// PrimeNG
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MenuItem, MessageService } from 'primeng/api';

// Services & Models
import { ChatSettingsService } from '../../services';
import { ChatsConfigs, OnlineUser, Bitacora, AgentStatus, StatusFilter } from '../../models';
import { AuthService } from '@core/services/auth.service';

// Components
import { AgentStatusDialogComponent } from '../../components/agent-status-dialog';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BreadcrumbModule,
    ButtonModule,
    ToggleSwitchModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    TagModule,
    ToastModule,
    TabsModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    AgentStatusDialogComponent
  ],
  providers: [MessageService],
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent implements OnInit {
  private readonly chatSettingsService = inject(ChatSettingsService);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  // Breadcrumb
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'SAC', routerLink: '/sac' },
    { label: 'Chats' },
    { label: 'Ajustes SAC' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Form
  form!: FormGroup;
  private initialFormValue!: ChatsConfigs;

  // State signals
  readonly allAgents = signal<OnlineUser[]>([]);
  readonly filteredAgents = signal<OnlineUser[]>([]);
  readonly selectedAgent = signal<OnlineUser | null>(null);
  readonly showDialog = signal(false);
  readonly hasChanges = signal(false);
  readonly activeFilter = signal<string>('all');
  readonly searchTerm = signal<string>('');

  // Filtros de estado
  readonly statusFilters = signal<StatusFilter[]>([
    { id: 'all', name: 'Todos', qty: 0 },
    { id: 'online', name: 'Online', qty: 0 },
    { id: 'offline', name: 'Offline', qty: 0 }
  ]);

  // Computed values
  readonly totalAgents = computed(() => this.allAgents().length);

  readonly onlineAgents = computed(() =>
    this.allAgents().filter(a => a.currentStatus === 'online').length
  );

  readonly topAgent = computed(() => {
    const agents = this.allAgents();
    if (agents.length === 0) return null;

    return agents.reduce((max, agent) =>
      agent.activeChatRooms > max.activeChatRooms ? agent : max,
      agents[0]
    );
  });

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
    this.setupFormChangeDetection();
  }

  /**
   * Inicializa el formulario
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      automaticAssignment: [false],
      maximumAmountChatsPerAgent: [0],
      automaticMessage: [''],
      inactiveThresholdHours: [1],
      assignChatToSsacRole: [false]
    });
  }

  /**
   * Carga los datos iniciales
   */
  private loadInitialData(): void {
    // Cargar configuraciones
    this.chatSettingsService.getChatConfigs()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.form.patchValue(data);
          this.initialFormValue = this.cloneFormValue();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error cargando configuraciones:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las configuraciones'
          });
        }
      });

    // Cargar agentes
    this.chatSettingsService.getAgentSac()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (agents) => {
          this.allAgents.set(agents);
          this.filterAgents('all');
          this.updateStatusCounts(agents);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error cargando agentes:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los agentes'
          });
        }
      });
  }

  /**
   * Configura la detección de cambios del formulario
   */
  private setupFormChangeDetection(): void {
    this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.checkForChanges();
        this.cdr.markForCheck();
      });
  }

  /**
   * Verifica si hay cambios en el formulario
   */
  private checkForChanges(): void {
    const currentValue = this.form.value;
    this.hasChanges.set(!this.areEqual(currentValue, this.initialFormValue));
  }

  /**
   * Clona el valor actual del formulario
   */
  private cloneFormValue(): ChatsConfigs {
    return JSON.parse(JSON.stringify(this.form.value));
  }

  /**
   * Compara dos objetos para determinar si son iguales
   */
  private areEqual(a: any, b: any): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  /**
   * Actualiza los contadores de estado
   */
  private updateStatusCounts(agents: OnlineUser[]): void {
    const filters = this.statusFilters();
    filters[0].qty = agents.length;
    filters[1].qty = agents.filter(a => a.currentStatus === 'online').length;
    filters[2].qty = agents.filter(a => a.currentStatus === 'offline').length;
    this.statusFilters.set([...filters]);
  }

  /**
   * Filtra agentes por estado
   */
  filterAgents(filterType: string): void {
    this.activeFilter.set(filterType);
    this.applyFilters();
  }

  /**
   * Filtra agentes por término de búsqueda
   */
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value.toLowerCase());
    this.applyFilters();
  }

  /**
   * Aplica todos los filtros (estado y búsqueda)
   */
  private applyFilters(): void {
    let filtered = this.allAgents();

    // Filtrar por estado
    const filterType = this.activeFilter();
    switch (filterType) {
      case 'online':
        filtered = filtered.filter(a => a.currentStatus === 'online');
        break;
      case 'offline':
        filtered = filtered.filter(a => a.currentStatus === 'offline');
        break;
    }

    // Filtrar por búsqueda
    const search = this.searchTerm();
    if (search) {
      filtered = filtered.filter(a =>
        a.name?.toLowerCase().includes(search) ||
        a.username?.toLowerCase().includes(search)
      );
    }

    // Ordenar por estado: Online -> Break -> Offline
    filtered = this.sortAgentsByStatus(filtered);

    this.filteredAgents.set(filtered);
  }

  /**
   * Ordena los agentes por estado
   * Prioridad: online > break > offline
   */
  private sortAgentsByStatus(agents: OnlineUser[]): OnlineUser[] {
    const statusPriority: Record<AgentStatus, number> = {
      'online': 1,
      'break': 2,
      'offline': 3
    };

    return agents.sort((a, b) => {
      const priorityA = statusPriority[a.currentStatus] || 999;
      const priorityB = statusPriority[b.currentStatus] || 999;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Si tienen el mismo estado, ordenar por cantidad de chats (descendente)
      return b.activeChatRooms - a.activeChatRooms;
    });
  }

  /**
   * Abre el diálogo para cambiar el estado de un agente
   */
  openStatusDialog(agent: OnlineUser): void {
    this.selectedAgent.set({ ...agent });
    this.showDialog.set(true);
  }

  /**
   * Actualiza el estado de un agente
   */
  onStatusUpdate(newStatus: AgentStatus): void {
    const agent = this.selectedAgent();
    const userData = this.authService.getUserDataFromToken();

    if (!agent || !userData) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo obtener la información del usuario'
      });
      return;
    }

    if (agent.activeChatRooms > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se puede cambiar el estado de un agente con chats activos'
      });
      return;
    }

    const { name, id } = userData;
    const bitacora: Bitacora = {
      createdAt: Timestamp.fromDate(new Date()),
      sacUserId: agent.uid,
      status: newStatus,
      uid: '',
      updateStatusBy: id,
      username: name
    };

    this.chatSettingsService.saveBitacora(bitacora)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Estado actualizado a ${newStatus}`
        });
        this.showDialog.set(false);
        this.selectedAgent.set(null);
        this.cdr.markForCheck();
      })
      .catch((error) => {
        console.error('Error actualizando estado:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el estado del agente'
        });
      });
  }

  /**
   * Cancela las operaciones
   */
  cancelOperations(): void {
    this.form.patchValue(this.initialFormValue);
    this.hasChanges.set(false);
    this.messageService.add({
      severity: 'warn',
      summary: 'Cancelado',
      detail: 'Se han descartado los cambios'
    });
  }

  /**
   * Guarda los cambios de configuración
   */
  saveChanges(): void {
    if (!this.hasChanges() || !this.form.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No hay cambios para guardar o el formulario no es válido'
      });
      return;
    }

    const data: Partial<ChatsConfigs> = this.form.value;

    this.chatSettingsService.saveConfigs(data)
      .then(() => {
        this.initialFormValue = this.cloneFormValue();
        this.hasChanges.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Configuraciones guardadas correctamente'
        });
        this.cdr.markForCheck();
      })
      .catch((error) => {
        console.error('Error guardando configuraciones:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron guardar las configuraciones'
        });
      });
  }

  /**
   * Obtiene la clase CSS según el estado
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-500';
      case 'break':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  }

  /**
   * Obtiene el severity de PrimeNG según el estado
   */
  getStatusSeverity(status: string): 'success' | 'danger' | 'warn' {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'danger';
      case 'break':
        return 'warn';
      default:
        return 'danger';
    }
  }
}
