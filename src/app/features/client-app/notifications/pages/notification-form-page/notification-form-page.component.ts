import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';

import { NotificationService } from '../../services';
import { LaunchType, PushTypeEnum, DAYS_OF_WEEK, HOUR_OPTIONS, PUSH_TYPE_OPTIONS } from '../../models';
import { SmsAuthorizationDialogComponent } from '../../components/sms-authorization-dialog/sms-authorization-dialog.component';

@Component({
  selector: 'app-notification-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MessageModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    CheckboxModule,
    DatePickerModule,
    BreadcrumbModule,
    MultiSelectModule,
    SmsAuthorizationDialogComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-form-page.component.html',
  styleUrl: './notification-form-page.component.scss'
})
export class NotificationFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  // State
  readonly isEditMode = signal(false);
  readonly notificationId = signal<number | null>(null);
  readonly isSaving = signal(false);
  readonly showAuthDialog = signal(false);
  readonly createdNotificationId = signal<number | null>(null);

  // Form
  notificationForm!: FormGroup;

  // Breadcrumb
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Clientes', routerLink: '/client-app' },
    { label: 'Gestión de Notificaciones', routerLink: '/client-app/sms-push-notifications' },
    { label: 'Nueva Notificación' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Enums and options
  readonly LaunchType = LaunchType;
  readonly PushTypeEnum = PushTypeEnum;
  readonly DAYS_OF_WEEK = DAYS_OF_WEEK;
  readonly HOUR_OPTIONS = HOUR_OPTIONS;
  readonly PUSH_TYPE_OPTIONS = PUSH_TYPE_OPTIONS;
  readonly minDate = new Date();

  // Mock target audiences (TODO: Load from API)
  readonly targetAudiences = [
    { label: 'Todos los usuarios', value: 'all_users' },
    { label: 'Usuarios Android', value: 'android_users' },
    { label: 'Usuarios iOS', value: 'ios_users' },
    { label: 'Usuarios Premium', value: 'premium_users' },
    { label: 'Usuarios Nuevos', value: 'new_users' }
  ];

  // Computed
  readonly selectedLaunchType = computed(() => {
    return this.notificationForm?.get('launchType')?.value || LaunchType.ONE_HOT;
  });

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
  }

  initializeForm(): void {
    this.notificationForm = this.fb.group({
      // Basic info
      title: ['', [Validators.required, Validators.maxLength(100)]],
      message: ['', [Validators.required, Validators.maxLength(500)]],
      type: [PushTypeEnum.ALERT, Validators.required],
      targets: [[], Validators.required],

      // Launch configuration
      launchType: [LaunchType.ONE_HOT, Validators.required],

      // Schedule configuration
      scheduleDate: [null],
      scheduleTime: [null],

      // Recurrent configuration
      recurrentDays: [[]],
      recurrentHour: [null],

      // Optional fields
      imageUrl: [''],
      actionUrl: ['']
    });

    // Update validators based on launch type
    effect(() => {
      const launchType = this.selectedLaunchType();
      this.updateValidators(launchType);
    }, { allowSignalWrites: true });
  }

  updateValidators(launchType: LaunchType): void {
    const scheduleDate = this.notificationForm.get('scheduleDate');
    const scheduleTime = this.notificationForm.get('scheduleTime');
    const recurrentDays = this.notificationForm.get('recurrentDays');
    const recurrentHour = this.notificationForm.get('recurrentHour');

    // Clear all validators first
    scheduleDate?.clearValidators();
    scheduleTime?.clearValidators();
    recurrentDays?.clearValidators();
    recurrentHour?.clearValidators();

    // Add validators based on launch type
    if (launchType === LaunchType.SCHEDULE) {
      scheduleDate?.setValidators([Validators.required]);
      scheduleTime?.setValidators([Validators.required]);
    } else if (launchType === LaunchType.RECURRENT) {
      recurrentDays?.setValidators([Validators.required, Validators.minLength(1)]);
      recurrentHour?.setValidators([Validators.required]);
    }

    // Update validity
    scheduleDate?.updateValueAndValidity();
    scheduleTime?.updateValueAndValidity();
    recurrentDays?.updateValueAndValidity();
    recurrentHour?.updateValueAndValidity();
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.notificationId.set(Number(id));
      this.breadcrumbItems[2].label = 'Editar Notificación';
      // TODO: Load notification data
    }
  }

  onSubmit(): void {
    if (this.notificationForm.invalid) {
      this.notificationForm.markAllAsTouched();
      return;
    }

    const formValue = this.notificationForm.getRawValue();
    this.isSaving.set(true);

    // Build push structure based on form data
    const pushData = this.buildPushData(formValue);

    const request = this.isEditMode()
      ? this.notificationService.updateNotification(this.notificationId()!, pushData)
      : this.notificationService.createNotification(pushData);

    request.subscribe({
      next: (response: any) => {
        this.isSaving.set(false);

        // If it's a ONE_HOT notification, show authorization dialog
        if (formValue.launchType === LaunchType.ONE_HOT) {
          this.createdNotificationId.set(response.idPush || response.id);
          this.showAuthDialog.set(true);
        } else {
          // For scheduled/recurrent, just navigate back
          this.router.navigate(['/client-app/sms-push-notifications']);
        }
      },
      error: (err) => {
        console.error('Error saving notification:', err);
        this.isSaving.set(false);
      }
    });
  }

  buildPushData(formValue: any): any {
    const baseData = {
      title: formValue.title,
      message: formValue.message,
      type: formValue.type,
      targets: formValue.targets,
      imageUrl: formValue.imageUrl || undefined,
      actionUrl: formValue.actionUrl || undefined
    };

    // Add launch configuration based on type
    if (formValue.launchType === LaunchType.ONE_HOT) {
      return {
        ...baseData,
        launchType: LaunchType.ONE_HOT
      };
    } else if (formValue.launchType === LaunchType.SCHEDULE) {
      return {
        ...baseData,
        launchType: LaunchType.SCHEDULE,
        scheduleConfig: {
          date: formValue.scheduleDate,
          time: formValue.scheduleTime
        }
      };
    } else if (formValue.launchType === LaunchType.RECURRENT) {
      return {
        ...baseData,
        launchType: LaunchType.RECURRENT,
        recurrentConfig: {
          daysOfWeek: formValue.recurrentDays,
          hour: formValue.recurrentHour
        }
      };
    }

    return baseData;
  }

  onCancel(): void {
    this.router.navigate(['/client-app/sms-push-notifications']);
  }

  // Form field helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.notificationForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.notificationForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['minlength']) return `Debe seleccionar al menos ${field.errors['minlength'].requiredLength} opción`;
    }
    return '';
  }

  /**
   * Authorization dialog handlers
   */
  onAuthorizationSuccess(): void {
    this.showAuthDialog.set(false);
    this.router.navigate(['/client-app/sms-push-notifications']);
  }

  onAuthorizationCancel(): void {
    this.showAuthDialog.set(false);
    // Stay on form, notification was created but not sent
  }
}
