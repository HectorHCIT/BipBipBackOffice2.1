import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppLinkService } from '../../services';
import { DynamicLinkProduct, STATUS_FILTER_OPTIONS } from '../../models';

@Component({
  selector: 'app-app-links-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    CardModule,
    InputTextModule,
    SelectModule,
    ToggleSwitchModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './app-links-list-page.component.html',
  styleUrls: ['./app-links-list-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLinksListPageComponent implements OnInit {
  private readonly appLinkService = inject(AppLinkService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly appLinks = this.appLinkService.appLinks;
  readonly pagination = this.appLinkService.pagination;
  readonly isLoading = this.appLinkService.isLoading;

  readonly statusFilterOptions = STATUS_FILTER_OPTIONS;

  readonly searchTerm = signal('');
  readonly statusFilter = signal<boolean | null>(null);
  readonly page = signal(1);
  readonly pageSize = signal(10);

  private readonly searchSubject = new Subject<string>();

  readonly pageSizeOptions = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '15', value: 15 },
    { label: '20', value: 20 },
  ];

  ngOnInit(): void {
    this.loadData();
    this.setupSearchDebounce();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((search) => {
        this.searchTerm.set(search);
        this.page.set(1);
        this.loadData();
      });
  }

  private loadData(): void {
    this.appLinkService.loadAppLinks({
      page: this.page(),
      pageSize: this.pageSize(),
      status: this.statusFilter(),
      search: this.searchTerm(),
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onStatusFilterChange(): void {
    this.page.set(1);
    this.loadData();
  }

  onPageChange(event: any): void {
    this.page.set(event.page + 1);
    this.pageSize.set(event.rows);
    this.loadData();
  }

  onCreateAppLink(): void {
    this.router.navigate(['/notification-managements/app-link/new']);
  }

  onEditAppLink(appLink: DynamicLinkProduct): void {
    this.router.navigate([
      '/notification-managements/app-link/edit',
      appLink.campaignName || appLink.dynamicLinkXProductId,
    ]);
  }

  onToggleStatus(appLink: DynamicLinkProduct, event: boolean): void {
    const newStatus = event;
    this.appLinkService.changeStatus(appLink.dynamicLinkXProductId, newStatus).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `App link ${newStatus ? 'activado' : 'desactivado'} exitosamente`,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cambiar el estado del app link',
        });
      },
    });
  }

  async onCopyDeepLink(appLink: DynamicLinkProduct): Promise<void> {
    try {
      await navigator.clipboard.writeText(appLink.deepLink);
      this.messageService.add({
        severity: 'success',
        summary: 'Copiado',
        detail: 'Enlace copiado al portapapeles',
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo copiar el enlace',
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
