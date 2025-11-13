import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PersonalizedAlertsService } from '../../services';
import {
  COMMON_ALERT_ICONS,
  ALERT_COLOR_PRESETS,
  CreateUpdatePersonalizedAlertRequest,
} from '../../models';
import { AlertPreviewComponent } from '../../components';

@Component({
  selector: 'app-alert-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ColorPickerModule,
    SelectModule,
    ToastModule,
    AlertPreviewComponent,
  ],
  providers: [MessageService],
  templateUrl: './alert-detail-page.component.html',
  styleUrls: ['./alert-detail-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertDetailPageComponent implements OnInit {
  private readonly alertsService = inject(PersonalizedAlertsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  readonly isEditMode = signal(false);
  readonly isLoading = signal(false);
  readonly alertCode = signal<string | null>(null);

  readonly iconOptions = COMMON_ALERT_ICONS;

  readonly colorPresets = ALERT_COLOR_PRESETS;

  readonly alertForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^[A-Z_]+$/)]],
    codePointIcon: ['info', Validators.required],
    textColor: ['FFFFFF', [Validators.required, Validators.pattern(/^[0-9A-Fa-f]{6}$/)]],
    backgroundColor: ['3B82F6', [Validators.required, Validators.pattern(/^[0-9A-Fa-f]{6}$/)]],
    title: ['', [Validators.required, Validators.maxLength(100)]],
    subtitle: ['', [Validators.required, Validators.maxLength(250)]],
  });

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      this.isEditMode.set(true);
      this.alertCode.set(code);
      this.loadAlert(code);
      this.alertForm.get('code')?.disable();
    }
  }

  private loadAlert(code: string): void {
    this.isLoading.set(true);
    this.alertsService.getAlertByCode(code).subscribe({
      next: (alert) => {
        this.alertForm.patchValue(alert);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Error al cargar la alerta ${code}`
        });
        this.router.navigate(['/notification-managements/custom-alerts']);
      },
    });
  }

  applyColorPreset(preset: typeof ALERT_COLOR_PRESETS[0]): void {
    this.alertForm.patchValue({
      textColor: preset.textColor,
      backgroundColor: preset.backgroundColor,
    });
  }

  onSubmit(): void {
    if (this.alertForm.invalid) {
      this.alertForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formValue = this.alertForm.getRawValue() as CreateUpdatePersonalizedAlertRequest;

    const request$ = this.isEditMode()
      ? this.alertsService.updateAlert(this.alertCode()!, formValue)
      : this.alertsService.createAlert(formValue);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.isEditMode() ? 'Alerta actualizada exitosamente' : 'Alerta creada exitosamente'
        });
        this.router.navigate(['/notification-managements/custom-alerts']);
      },
      error: () => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.isEditMode() ? 'Error al actualizar la alerta' : 'Error al crear la alerta'
        });
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/notification-managements/custom-alerts']);
  }
}
