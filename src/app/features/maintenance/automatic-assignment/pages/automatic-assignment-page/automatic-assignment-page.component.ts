import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
  OnDestroy,
  viewChild,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { interval, Subject, Subscription } from 'rxjs';
import { takeUntil, startWith, switchMap } from 'rxjs/operators';
import { AutomaticAssignmentService } from '../../services';
import { AssignmentListTableComponent } from '../../components/tables/assignment-list-table/assignment-list-table.component';
import { CitySummaryPanelComponent } from '../../components/tables/city-summary-panel/city-summary-panel.component';
import { AssignmentFilterComponent } from '../../components/filters/assignment-filter/assignment-filter.component';
import {
  type AssignmentFilterParams,
  type AssignmentSearchParams
} from '../../models';

/**
 * AutomaticAssignmentPageComponent
 *
 * Main page for monitoring automatic assignments in real-time
 * Features:
 * - Auto-refresh every 60 seconds
 * - Visual countdown timer
 * - Dual view (table + city summary)
 * - Advanced filtering with sidebar
 * - Search functionality
 * - Manual refresh button
 */
@Component({
  selector: 'app-automatic-assignment-page',
  imports: [
    CommonModule,
    BreadcrumbModule,
    ButtonModule,
    CardModule,
    ProgressBarModule,
    AssignmentListTableComponent,
    CitySummaryPanelComponent,
    AssignmentFilterComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto p-6">
      <!-- Breadcrumb -->
      <p-breadcrumb [model]="breadcrumbItems" [home]="breadcrumbHome" styleClass="mb-4" />

      <!-- Page Header -->
      <div class="flex justify-between items-start mb-8 gap-8 flex-wrap lg:flex-nowrap">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">
            <i class="pi pi-sync mr-3 text-primary"></i>
            Asignación Automática
          </h1>
          <p class="text-gray-600 mt-2">
            Monitoreo en tiempo real de asignaciones automáticas
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-4 flex-wrap">
          <!-- Auto-refresh countdown and last update -->
          <div class="flex flex-col gap-2 min-w-[200px]">
            @if (lastUpdateTime()) {
              <div class="flex items-center text-sm text-gray-600">
                <i class="pi pi-check-circle mr-2 text-green-600"></i>
                <span>Última actualización: <strong>{{ lastUpdateTime() }}</strong></span>
              </div>
            }
            <div class="flex items-center text-sm text-gray-500">
              <i class="pi pi-clock mr-2"></i>
              <span>Próxima actualización en {{ countdown() }}s</span>
            </div>
            <p-progressBar
              [value]="progressValue()"
              [showValue]="false"
              styleClass="h-1" />
          </div>

          <!-- Manual refresh button -->
          <p-button
            icon="pi pi-refresh"
            [outlined]="true"
            severity="secondary"
            pTooltip="Actualizar ahora"
            tooltipPosition="bottom"
            [loading]="isLoading()"
            (onClick)="manualRefresh()" />

          <!-- Filter toggle button -->
          <p-button
            icon="pi pi-filter"
            [outlined]="!hasActiveFilters()"
            [severity]="hasActiveFilters() ? 'primary' : 'secondary'"
            pTooltip="Filtros"
            tooltipPosition="bottom"
            [badge]="filterCount() > 0 ? filterCount().toString() : undefined"
            (onClick)="toggleFilters()" />
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 xl:grid-cols-[70%_30%] gap-6 mb-8">
        <!-- Left: Main Table (70%) -->
        <div class="min-w-0">
          <app-assignment-list-table
            [assignments]="assignments()"
            [loading]="isLoading()"
            [totalRecords]="totalRecords()"
            [pageSize]="pageSize()"
            [first]="firstRecord()"
            (onPageChange)="handlePageChange($event)" />
        </div>

        <!-- Right: City Summary (30%) -->
        <div class="min-w-0 xl:order-none order-first">
          <app-city-summary-panel
            [assignmentsByCity]="assignmentsByCity()"
            [loading]="isLoadingCities()" />
        </div>
      </div>
    </div>

    <!-- Filter Sidebar -->
    <app-assignment-filter
      (onFilter)="handleFilter($event)"
      (onSearch)="handleSearch($event)"
      (onClear)="handleClearFilters()" />
  `
})
export class AutomaticAssignmentPageComponent implements OnInit, OnDestroy {
  private readonly assignmentService = inject(AutomaticAssignmentService);
  private readonly destroy$ = new Subject<void>();
  private refreshSubscription?: Subscription;

  // Constants
  private readonly REFRESH_INTERVAL_MS = 60000; // 60 seconds
  private readonly COUNTDOWN_INTERVAL_MS = 1000; // 1 second

  // ViewChild
  readonly filterComponent = viewChild(AssignmentFilterComponent);

  // State signals
  readonly assignments = this.assignmentService.assignments;
  readonly assignmentsByCity = this.assignmentService.assignmentsByCity;
  readonly isLoading = this.assignmentService.isLoading;
  readonly totalRecords = this.assignmentService.totalRecords;
  readonly pageSize = this.assignmentService.pageSize;
  readonly currentPage = this.assignmentService.currentPage;
  readonly isLoadingCities = signal(false);

  // Filter state
  readonly activeFilters = signal<AssignmentFilterParams | null>(null);
  readonly activeSearch = signal<string | null>(null);
  readonly countdown = signal(60);
  readonly lastUpdateTime = signal<string>('');

  // Computed signals
  readonly hasActiveFilters = computed(() => {
    return this.activeFilters() !== null || this.activeSearch() !== null;
  });

  readonly filterCount = computed(() => {
    const filters = this.activeFilters();
    if (!filters) return 0;

    let count = 0;
    if (filters.countries && filters.countries.length > 0) count++;
    if (filters.cities && filters.cities.length > 0) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    return count;
  });

  readonly progressValue = computed(() => {
    return (this.countdown() / 60) * 100;
  });

  // Calculate first record index for pagination (0-based)
  readonly firstRecord = computed(() => {
    return (this.currentPage() - 1) * this.pageSize();
  });

  // Breadcrumb
  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Mantenimiento', routerLink: '/maintenance' },
    { label: 'Asignación Automática' }
  ];

  ngOnInit(): void {
    this.loadData();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.refreshSubscription?.unsubscribe();
  }

  /**
   * Load initial data
   */
  private loadData(): void {
    // Load main list
    this.loadAssignments();

    // Load city summary
    this.loadCitySummary();

    // Update last update time
    this.updateLastUpdateTime();
  }

  /**
   * Update last update time with current time
   */
  private updateLastUpdateTime(): void {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    const displayHours = now.getHours() % 12 || 12;

    this.lastUpdateTime.set(`${displayHours.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`);
  }

  /**
   * Load assignments based on current filters/search
   */
  private loadAssignments(): void {
    const pageNumber = this.currentPage();
    const pageSize = this.pageSize();

    // Priority: search > filters > all
    if (this.activeSearch()) {
      const searchParams: AssignmentSearchParams = {
        parameter: this.activeSearch()!,
        pageNumber,
        pageSize
      };
      this.assignmentService.searchAssignments(searchParams).subscribe();
    } else if (this.activeFilters()) {
      const filterParams = {
        ...this.activeFilters()!,
        pageNumber,
        pageSize
      };
      this.assignmentService.getAssignmentsByFilter(filterParams).subscribe();
    } else {
      this.assignmentService.getAssignmentList(pageNumber, pageSize).subscribe();
    }
  }

  /**
   * Load city summary
   */
  private loadCitySummary(): void {
    this.isLoadingCities.set(true);
    this.assignmentService.getAssignmentsByCity().subscribe({
      next: () => {
        this.isLoadingCities.set(false);
      },
      error: (error) => {
        console.error('Error loading city summary:', error);
        this.isLoadingCities.set(false);
      }
    });
  }

  /**
   * Start auto-refresh timer
   */
  private startAutoRefresh(): void {
    // Reset countdown
    this.countdown.set(60);

    // Create countdown timer (updates every second)
    const countdown$ = interval(this.COUNTDOWN_INTERVAL_MS).pipe(
      takeUntil(this.destroy$)
    );

    countdown$.subscribe(() => {
      const current = this.countdown();
      if (current > 0) {
        this.countdown.set(current - 1);
      }
    });

    // Create refresh timer (triggers every 60 seconds)
    this.refreshSubscription = interval(this.REFRESH_INTERVAL_MS)
      .pipe(
        startWith(0), // Start immediately
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadData();
        this.countdown.set(60); // Reset countdown
      });
  }

  /**
   * Manual refresh
   */
  manualRefresh(): void {
    this.loadData();
    this.countdown.set(60);
  }

  /**
   * Handle page change
   */
  handlePageChange(event: any): void {
    // PrimeNG pagination event: { first: number, rows: number }
    // first: index of the first record (0-based)
    // rows: number of rows per page
    const page = Math.floor(event.first / event.rows) + 1; // Convert to 1-based page
    const pageSize = event.rows;

    this.assignmentService.currentPage.set(page);
    this.assignmentService.pageSize.set(pageSize);
    this.loadAssignments();
  }

  /**
   * Handle filter application
   */
  handleFilter(filterParams: AssignmentFilterParams): void {
    this.activeFilters.set(filterParams);
    this.activeSearch.set(null);
    this.assignmentService.currentPage.set(1);
    this.loadAssignments();
  }

  /**
   * Handle search
   */
  handleSearch(searchText: string): void {
    this.activeSearch.set(searchText);
    this.activeFilters.set(null);
    this.assignmentService.currentPage.set(1);
    this.loadAssignments();
  }

  /**
   * Handle clear filters
   */
  handleClearFilters(): void {
    this.activeFilters.set(null);
    this.activeSearch.set(null);
    this.assignmentService.currentPage.set(1);
    this.loadAssignments();
  }

  /**
   * Toggle filter sidebar
   */
  toggleFilters(): void {
    const filter = this.filterComponent();
    if (filter) {
      const isVisible = filter.visible();
      if (isVisible) {
        filter.hide();
      } else {
        filter.show();
      }
    }
  }
}
