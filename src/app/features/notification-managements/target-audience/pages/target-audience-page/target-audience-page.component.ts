import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { PopoverModule } from 'primeng/popover';
import { ToastModule } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';

import { TargetAudienceService } from '../../services';
import { TargetAudienceFormComponent } from '../../components/target-audience-form/target-audience-form.component';
import { TargetAudience, TargetAudienceFilters } from '../../models';

@Component({
  selector: 'app-target-audience-page',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TagModule,
    CardModule,
    ProgressSpinnerModule,
    BreadcrumbModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    PopoverModule,
    ToastModule,
    TargetAudienceFormComponent
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './target-audience-page.component.html',
  styleUrl: './target-audience-page.component.scss'
})
export class TargetAudiencePageComponent implements OnInit {
  private readonly targetAudienceService = inject(TargetAudienceService);
  private readonly messageService = inject(MessageService);

  // Breadcrumb
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Gest. Notificaciones', routerLink: '/notification-managements' },
    { label: 'Público Objetivo' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Expose service signals to template
  readonly targetAudiences = this.targetAudienceService.targetAudiences;
  readonly isLoading = this.targetAudienceService.isLoading;
  readonly totalRecords = this.targetAudienceService.totalRecords;

  // Filter state
  readonly filters = signal<TargetAudienceFilters>({
    search: undefined,
    isActive: undefined,
    page: 1,
    pageSize: 10
  });

  // Form drawer state
  readonly isFormVisible = signal(false);
  readonly selectedTargetAudience = signal<TargetAudience | null>(null);

  // Status filter options
  readonly statusOptions = [
    { label: 'Todos', value: undefined },
    { label: 'Activos', value: true },
    { label: 'Inactivos', value: false }
  ];

  // Expose Math to template
  readonly Math = Math;

  ngOnInit(): void {
    this.loadData();
    this.targetAudienceService.loadCountries();
  }

  /**
   * Load target audiences with current filters
   */
  loadData(): void {
    this.targetAudienceService.loadTargetAudiences(this.filters());
  }

  /**
   * Handle search input
   */
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filters.update(f => ({ ...f, search: value, page: 1 }));
    this.loadData();
  }

  /**
   * Handle status filter change
   */
  onStatusFilterChange(isActive: boolean | undefined): void {
    this.filters.update(f => ({ ...f, isActive, page: 1 }));
    this.loadData();
  }

  /**
   * Handle pagination
   */
  onPageChange(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? 10;
    const page = Math.floor(first / rows) + 1;
    this.filters.update(f => ({ ...f, page, pageSize: rows }));
    this.loadData();
  }

  /**
   * Open form drawer for creating new target audience
   */
  onCreate(): void {
    this.selectedTargetAudience.set(null);
    this.isFormVisible.set(true);
  }

  /**
   * Open form drawer for editing target audience
   */
  onEdit(targetAudience: TargetAudience): void {
    this.selectedTargetAudience.set(targetAudience);
    this.isFormVisible.set(true);
  }

  /**
   * Handle form close
   */
  onFormClose(): void {
    this.isFormVisible.set(false);
    this.selectedTargetAudience.set(null);
  }

  /**
   * Handle form save success
   */
  onFormSave(): void {
    this.isFormVisible.set(false);
    this.selectedTargetAudience.set(null);
    this.loadData();
  }

  /**
   * Get severity for p-tag based on status
   */
  getStatusSeverity(isActive: boolean): 'success' | 'secondary' {
    return isActive ? 'success' : 'secondary';
  }

  /**
   * Get status label
   */
  getStatusLabel(isActive: boolean): string {
    return isActive ? 'ACTIVO' : 'INACTIVO';
  }
}
