import { Component, ChangeDetectionStrategy, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

import { RegisteredUsersService } from '../../../../services';
import { GrantBipsForm } from '../../../../models';

@Component({
  selector: 'app-grant-bips-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    SelectModule,
    InputNumberModule,
    TextareaModule,
    ButtonModule,
    MessageModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grant-bips-tab.component.html',
  styleUrl: './grant-bips-tab.component.scss'
})
export class GrantBipsTabComponent {
  readonly userId = input.required<number>();

  private readonly fb = inject(FormBuilder);
  private readonly registeredUsersService = inject(RegisteredUsersService);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly actionOptions = [
    { label: 'Otorgar Bips', value: 'grant' },
    { label: 'Quitar Bips', value: 'deduct' }
  ];

  readonly grantBipsForm = signal<FormGroup>(
    this.fb.group({
      action: ['', Validators.required],
      quantity: [null, [Validators.required, Validators.min(1)]],
      reason: ['', Validators.required]
    })
  );

  onSubmit(): void {
    if (this.grantBipsForm().invalid) {
      this.grantBipsForm().markAllAsTouched();
      return;
    }

    const customerId = this.userId();
    if (!customerId) return;

    this.isSubmitting.set(true);
    this.error.set(null);
    this.success.set(null);

    const formValue = this.grantBipsForm().value;
    const action = formValue.action;
    const data: GrantBipsForm = {
      quantity: formValue.quantity,
      reason: formValue.reason
    };

    this.registeredUsersService.grantBips(customerId, action, data).subscribe({
      next: () => {
        this.success.set('Bips otorgados/deducidos correctamente');
        this.isSubmitting.set(false);
        this.resetForm();
        // Trigger refresh for other tabs
        this.registeredUsersService.triggerRefresh();
      },
      error: (err) => {
        this.error.set('Error al otorgar/deducir Bips');
        this.isSubmitting.set(false);
        console.error('Error granting/deducting bips:', err);
      }
    });
  }

  resetForm(): void {
    this.grantBipsForm().reset();
    this.error.set(null);
    this.success.set(null);
  }
}
