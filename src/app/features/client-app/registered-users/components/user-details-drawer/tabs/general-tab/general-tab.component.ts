import { Component, ChangeDetectionStrategy, input, signal, computed, inject, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PaginatorModule } from 'primeng/paginator';
import { Subscription } from 'rxjs';

import { RegisteredUsersService } from '../../../../services';
import { CustomerProfile, CustomerAddress } from '../../../../models';

interface PaginatorState {
  page?: number;
  first?: number;
  rows?: number;
  pageCount?: number;
}

type AddressFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-general-tab',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TagModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
    PaginatorModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './general-tab.component.html',
  styleUrl: './general-tab.component.scss'
})
export class GeneralTabComponent implements OnDestroy {
  readonly userId = input.required<number>();

  private readonly registeredUsersService = inject(RegisteredUsersService);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly customerProfile = signal<CustomerProfile | null>(null);

  // Address filtering and pagination
  readonly addressFilter = signal<AddressFilter>('all');
  readonly currentAddressPage = signal(1);
  readonly addressPageSize = 6;

  readonly filteredAddresses = computed(() => {
    const addresses = this.customerProfile()?.addresses ?? [];
    const filter = this.addressFilter();

    // Sort addresses: isMain first, then others
    const sortedAddresses = [...addresses].sort((a, b) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      return 0;
    });

    if (filter === 'active') {
      return sortedAddresses.filter(addr => addr.isActive);
    } else if (filter === 'inactive') {
      return sortedAddresses.filter(addr => !addr.isActive);
    }
    return sortedAddresses;
  });

  readonly totalAddressPages = computed(() =>
    Math.ceil(this.filteredAddresses().length / this.addressPageSize)
  );

  readonly paginatedAddresses = computed(() => {
    const filtered = this.filteredAddresses();
    const page = this.currentAddressPage();
    const startIndex = (page - 1) * this.addressPageSize;
    const endIndex = startIndex + this.addressPageSize;
    return filtered.slice(startIndex, endIndex);
  });

  private refreshSubscription?: Subscription;

  constructor() {
    // Load data when userId changes
    effect(() => {
      const id = this.userId();
      if (id) {
        this.loadCustomerProfile();
      }
    });

    // Subscribe to refresh events
    this.refreshSubscription = this.registeredUsersService.refresh$.subscribe(() => {
      this.loadCustomerProfile();
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  private loadCustomerProfile(): void {
    const customerId = this.userId();
    if (!customerId) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.registeredUsersService.getCustomerProfile(customerId).subscribe({
      next: (profile) => {
        this.customerProfile.set(profile);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el perfil del cliente');
        this.isLoading.set(false);
        console.error('Error loading customer profile:', err);
      }
    });
  }

  setAddressFilter(filter: AddressFilter): void {
    this.addressFilter.set(filter);
    this.currentAddressPage.set(1); // Reset to first page when filter changes
  }

  onAddressPageChange(event: PaginatorState): void {
    const page = event.page ?? 0;
    this.currentAddressPage.set(page + 1);
  }

  openInGoogleMaps(latitude: number, longitude: number): void {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  }
}
