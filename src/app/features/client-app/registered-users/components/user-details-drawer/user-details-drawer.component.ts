import { Component, ChangeDetectionStrategy, input, output, signal, computed, inject, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { Subscription } from 'rxjs';

import { RegisteredUsersService } from '../../services';
import { AuthService } from '../../../../../core/services/auth.service';

// Import tab components (will be created next)
import { GeneralTabComponent } from './tabs/general-tab/general-tab.component';
import { OrdersTabComponent } from './tabs/orders-tab/orders-tab.component';
import { LoyaltyTabComponent } from './tabs/loyalty-tab/loyalty-tab.component';
import { BipLogsTabComponent } from './tabs/bip-logs-tab/bip-logs-tab.component';
import { IncidentsTabComponent } from './tabs/incidents-tab/incidents-tab.component';
import { GrantBipsTabComponent } from './tabs/grant-bips-tab/grant-bips-tab.component';
import { GrantBenefitsTabComponent } from './tabs/grant-benefits-tab/grant-benefits-tab.component';
import { SpecialPermissionsTabComponent } from './tabs/special-permissions-tab/special-permissions-tab.component';

@Component({
  selector: 'app-user-details-drawer',
  standalone: true,
  imports: [
    CommonModule,
    DrawerModule,
    TabsModule,
    ButtonModule,
    GeneralTabComponent,
    OrdersTabComponent,
    LoyaltyTabComponent,
    BipLogsTabComponent,
    IncidentsTabComponent,
    GrantBipsTabComponent,
    GrantBenefitsTabComponent,
    SpecialPermissionsTabComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-details-drawer.component.html',
  styleUrl: './user-details-drawer.component.scss'
})
export class UserDetailsDrawerComponent implements OnDestroy {
  readonly visible = input.required<boolean>();
  readonly userId = input.required<number | null>();
  readonly visibleChange = output<boolean>();

  private readonly authService = inject(AuthService);
  readonly registeredUsersService = inject(RegisteredUsersService);

  visibleModel = false;
  private refreshSubscription?: Subscription;

  // User role for access control
  readonly userRole = computed(() => this.authService.getUserRole()?.UserRole ?? '');
  readonly canAccessAdminTabs = computed(() =>
    this.userRole() === 'Administrador' || this.userRole() === 'SSAC'
  );

  // Active tab index
  readonly activeTabIndex = signal(0);

  constructor() {
    // Sync visible input with internal model and reset to first tab when opening
    effect(() => {
      this.visibleModel = this.visible();
      if (this.visible()) {
        this.activeTabIndex.set(0); // Always start at first tab when opening
      }
    });

    // Subscribe to refresh events
    this.refreshSubscription = this.registeredUsersService.refresh$.subscribe(() => {
      // Tabs will handle their own refresh logic
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  closeDrawer(): void {
    this.visibleModel = false;
    this.visibleChange.emit(false);
    this.activeTabIndex.set(0); // Reset to first tab
  }

  onVisibleChange(visible: boolean): void {
    this.visibleModel = visible;
    this.visibleChange.emit(visible);
    if (!visible) {
      this.activeTabIndex.set(0); // Reset to first tab when closing
    }
  }
}
