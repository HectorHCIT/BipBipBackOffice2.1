import { Component, ChangeDetectionStrategy, input, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SelectModule, SelectChangeEvent } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { RegisteredUsersService } from '../../../../services';
import { AvailableBenefit } from '../../../../models';

@Component({
  selector: 'app-grant-benefits-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    SelectModule,
    InputNumberModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grant-benefits-tab.component.html',
  styleUrl: './grant-benefits-tab.component.scss'
})
export class GrantBenefitsTabComponent {
  readonly userId = input.required<number>();

  private readonly fb = inject(FormBuilder);
  private readonly registeredUsersService = inject(RegisteredUsersService);

  readonly isLoadingBenefits = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorBenefits = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly availableBenefits = signal<AvailableBenefit[] | null>(null);
  readonly selectedBenefit = signal<AvailableBenefit | null>(null);

  readonly grantBenefitForm = signal<FormGroup>(
    this.fb.group({
      itemId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    })
  );

  constructor() {
    // Load available benefits when userId changes
    effect(() => {
      const id = this.userId();
      if (id) {
        this.loadAvailableBenefits();
      }
    });
  }

  private loadAvailableBenefits(): void {
    const customerId = this.userId();
    if (!customerId) return;

    this.isLoadingBenefits.set(true);
    this.errorBenefits.set(null);

    this.registeredUsersService.getAvailableBenefits(customerId).subscribe({
      next: (benefits) => {
        this.availableBenefits.set(benefits);
        this.isLoadingBenefits.set(false);
      },
      error: (err) => {
        this.errorBenefits.set('Error al cargar los beneficios disponibles');
        this.isLoadingBenefits.set(false);
        console.error('Error loading available benefits:', err);
      }
    });
  }

  onBenefitChange(event: SelectChangeEvent): void {
    const itemId = event.value;
    const benefit = this.availableBenefits()?.find(b => b.idLoyaltyItemWallet === itemId);
    this.selectedBenefit.set(benefit || null);
  }

  onSubmit(): void {
    if (this.grantBenefitForm().invalid) {
      this.grantBenefitForm().markAllAsTouched();
      return;
    }

    const customerId = this.userId();
    if (!customerId) return;

    this.isSubmitting.set(true);
    this.error.set(null);
    this.success.set(null);

    const formValue = this.grantBenefitForm().value;

    this.registeredUsersService
      .grantBenefit(customerId, formValue.itemId, formValue.quantity)
      .subscribe({
        next: () => {
          this.success.set('Beneficio otorgado correctamente');
          this.isSubmitting.set(false);
          this.resetForm();
          // Trigger refresh for other tabs
          this.registeredUsersService.triggerRefresh();
        },
        error: (err) => {
          this.error.set('Error al otorgar el beneficio');
          this.isSubmitting.set(false);
          console.error('Error granting benefit:', err);
        }
      });
  }

  resetForm(): void {
    this.grantBenefitForm().reset({ quantity: 1 });
    this.selectedBenefit.set(null);
    this.error.set(null);
    this.success.set(null);
  }
}
