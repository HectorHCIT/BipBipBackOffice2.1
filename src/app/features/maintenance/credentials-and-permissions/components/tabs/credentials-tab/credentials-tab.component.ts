import { Component, ChangeDetectionStrategy, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { PopoverModule } from 'primeng/popover';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { type Credential, type CredentialFilterCriteria } from '../../../models';
import { CredentialService } from '../../../services/credential.service';
import { CredentialsFormComponent } from '../../forms/credentials-form/credentials-form.component';
import { Subject } from 'rxjs';

/**
 * CredentialsTabComponent
 *
 * Displays a table of user credentials with filtering and pagination
 * Features:
 * - Server-side pagination
 * - Search and filter capabilities
 * - Status management
 * - Responsive design (table on desktop, cards on mobile)
 */
@Component({
  selector: 'app-credentials-tab',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    AvatarModule,
    PopoverModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    CredentialsFormComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './credentials-tab.component.html',
  styles: [`
    :host {
      display: block;
    }

    .credentials-tab {
      width: 100%;
    }
  `]
})
export class CredentialsTabComponent implements OnDestroy {
  private readonly credentialService = inject(CredentialService);
  private readonly destroy$ = new Subject<void>();

  // Form controls
  readonly searchControl = new FormControl<string>('');

  // Use service signals
  readonly credentials = this.credentialService.credentials;
  readonly loading = this.credentialService.isLoading;
  readonly totalRecords = this.credentialService.totalRecords;
  readonly activeCount = this.credentialService.totalActive;
  readonly inactiveCount = this.credentialService.totalInactive;
  readonly pageSize = this.credentialService.pageSize;
  readonly currentPage = this.credentialService.currentPage;
  readonly selectedStatus = signal<boolean | null>(null);

  // Form state
  readonly isFormOpen = signal(false);
  readonly selectedCredentialForEdit = signal<Credential | null>(null);

  constructor() {
    // Load initial data
    this.loadCredentials();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load credentials with current filters
   */
  private loadCredentials(): void {
    const criteria: CredentialFilterCriteria = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      userActive: this.selectedStatus() ?? undefined,
      search: this.searchControl.value || undefined
    };

    this.credentialService.getCredentials(criteria).subscribe({
      error: (error) => {
        console.error('Error loading credentials:', error);
        // TODO: Show error message to user
      }
    });
  }

  /**
   * Get user initials for avatar
   */
  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  /**
   * Handle search button click
   */
  onSearch(): void {
    this.currentPage.set(0);
    this.loadCredentials();
  }

  /**
   * Handle status filter change
   */
  onStatusFilter(status: boolean | null): void {
    this.selectedStatus.set(status);
    this.currentPage.set(0);
    this.loadCredentials();
  }

  /**
   * Handle page change
   */
  onPageChange(event: any): void {
    this.currentPage.set(event.first / event.rows);
    this.pageSize.set(event.rows);
    this.loadCredentials();
  }

  /**
   * Load more for mobile
   */
  loadMore(): void {
    this.currentPage.update(p => p + 1);
    this.loadCredentials();
  }

  /**
   * Action handlers
   */
  onCreateUser(): void {
    this.selectedCredentialForEdit.set(null);
    this.isFormOpen.set(true);
  }

  onEditUser(credential: Credential): void {
    this.selectedCredentialForEdit.set(credential);
    this.isFormOpen.set(true);
  }

  onToggleStatus(credential: Credential): void {
    const newStatus = !credential.userActive;

    this.credentialService.toggleCredentialStatus(credential.userId, newStatus).subscribe({
      next: () => {
        // TODO: Show success message to user
      },
      error: (error) => {
        console.error('Error toggling status:', error);
        // TODO: Show error message to user
      }
    });
  }

  /**
   * Handle form close
   */
  onFormClose(success: boolean): void {
    this.isFormOpen.set(false);
    this.selectedCredentialForEdit.set(null);

    // Reload credentials if form was submitted successfully
    if (success) {
      this.loadCredentials();
    }
  }
}
