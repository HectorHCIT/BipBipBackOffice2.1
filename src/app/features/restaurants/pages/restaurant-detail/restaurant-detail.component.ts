import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG
import { TabsModule } from 'primeng/tabs';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService, MenuItem } from 'primeng/api';

import { RestaurantService } from '../../services/restaurant.service';
import { InformationTabComponent } from '../../components/tabs/information-tab/information-tab.component';
import { ScaleTabComponent } from '../../components/tabs/scale-tab/scale-tab.component';
import { ScheduleTabComponent } from '../../components/tabs/schedule-tab/schedule-tab.component';
import { ConfigTabComponent } from '../../components/tabs/config-tab/config-tab.component';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [
    CommonModule,
    TabsModule,
    BreadcrumbModule,
    ButtonModule,
    ToastModule,
    InformationTabComponent,
    ScheduleTabComponent,
    ScaleTabComponent,
    ConfigTabComponent
  ],
  templateUrl: './restaurant-detail.component.html',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RestaurantDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly restaurantService = inject(RestaurantService);
  private readonly messageService = inject(MessageService);

  // State signals
  readonly restaurantId = signal<number | null>(null);
  readonly selectedTab = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  // Computed: Detect mode from URL and ID
  readonly mode = computed(() => {
    const url = this.router.url;
    const id = this.restaurantId();

    if (url.includes('/create')) return 'create';
    if (url.includes('/edit')) return 'edit';
    return 'view';
  });

  // Computed: Tab enabled state
  readonly tabsEnabled = computed(() => {
    const hasId = this.restaurantId() !== null;
    return {
      information: true, // Always enabled
      coverage: hasId,
      schedules: hasId,
      scale: hasId,
      configs: hasId
    };
  });

  // Computed: Breadcrumb items
  readonly breadcrumbItems = computed((): MenuItem[] => {
    const items: MenuItem[] = [
      { label: 'Restaurantes', routerLink: '/restaurants/restaurant' }
    ];

    const mode = this.mode();
    if (mode === 'create') {
      items.push({ label: 'Crear Restaurante' });
    } else if (mode === 'edit') {
      items.push({
        label: 'Editar Restaurante',
        routerLink: `/restaurants/restaurant/${this.restaurantId()}/edit`
      });
    } else {
      items.push({
        label: 'Detalles del Restaurante',
        routerLink: `/restaurants/restaurant/${this.restaurantId()}`
      });
    }

    return items;
  });

  readonly breadcrumbHome: MenuItem = {
    icon: 'pi pi-home',
    routerLink: '/home'
  };

  ngOnInit(): void {
    // Get restaurant ID from route params
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.restaurantId.set(parseInt(id, 10));
        this.loadRestaurantDetail();
      }
    });
  }

  /**
   * Load restaurant details if in edit/view mode
   */
  loadRestaurantDetail(): void {
    const id = this.restaurantId();
    if (!id) return;

    this.isLoading.set(true);
    // TODO: Implement getRestaurantDetail in service
    // this.restaurantService.getRestaurantDetail(id).subscribe({
    //   next: () => {
    //     this.isLoading.set(false);
    //   },
    //   error: (error) => {
    //     console.error('Error loading restaurant:', error);
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Error',
    //       detail: 'Error al cargar el restaurante'
    //     });
    //     this.isLoading.set(false);
    //   }
    // });
  }


  /**
   * Handle successful save from Information tab
   * Updates restaurantId and enables other tabs
   */
  onRestaurantSaved(restaurantId: number): void {
    this.restaurantId.set(restaurantId);

    // If we were in create mode, navigate to edit mode
    if (this.mode() === 'create') {
      this.router.navigate(['/restaurants/restaurant', restaurantId, 'edit'], {
        replaceUrl: true
      });
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Restaurante guardado correctamente'
    });
  }

  /**
   * Handle save error from tabs
   */
  onSaveError(errorMessage: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage || 'Error al guardar'
    });
  }

  /**
   * Navigate back to list
   */
  goBack(): void {
    this.router.navigate(['/restaurants/restaurant']);
  }
}
