import { Component, ChangeDetectionStrategy, signal, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { NotificationService } from '../../services';

@Component({
  selector: 'app-sms-authorization-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    ProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sms-authorization-dialog.component.html',
  styleUrl: './sms-authorization-dialog.component.scss'
})
export class SmsAuthorizationDialogComponent {
  private readonly notificationService = inject(NotificationService);

  // Inputs
  readonly visible = input.required<boolean>();
  readonly notificationId = input.required<number>();

  // Outputs
  readonly visibleChange = output<boolean>();
  readonly authorized = output<void>();
  readonly cancelled = output<void>();

  // State
  readonly authCode = signal('');
  readonly isRequestingCode = signal(false);
  readonly isVerifying = signal(false);
  readonly codeRequested = signal(false);
  readonly error = signal<string | null>(null);
  readonly countdown = signal(0);

  // Computed
  readonly canRequestCode = computed(() => {
    return !this.isRequestingCode() && !this.codeRequested();
  });

  readonly canVerify = computed(() => {
    return this.authCode().length === 4 && !this.isVerifying();
  });

  readonly isCodeExpired = computed(() => {
    return this.codeRequested() && this.countdown() === 0;
  });

  private countdownInterval: any;

  /**
   * Request authorization code
   */
  requestCode(): void {
    this.error.set(null);
    this.isRequestingCode.set(true);

    this.notificationService.requestAuthorization(this.notificationId()).subscribe({
      next: () => {
        this.isRequestingCode.set(false);
        this.codeRequested.set(true);
        this.startCountdown();
      },
      error: (err) => {
        this.isRequestingCode.set(false);
        this.error.set(err.error?.message || 'Error al solicitar el código. Intenta nuevamente.');
      }
    });
  }

  /**
   * Verify authorization code
   */
  verifyCode(): void {
    if (!this.canVerify()) return;

    this.error.set(null);
    this.isVerifying.set(true);

    this.notificationService.sendNotification(
      this.notificationId(),
      this.authCode()
    ).subscribe({
      next: () => {
        this.isVerifying.set(false);
        this.stopCountdown();
        this.close();
        this.authorized.emit();
      },
      error: (err) => {
        this.isVerifying.set(false);
        this.error.set(err.error?.message || 'Código incorrecto. Verifica e intenta nuevamente.');
      }
    });
  }

  /**
   * Start countdown timer (5 minutes = 300 seconds)
   */
  startCountdown(): void {
    this.countdown.set(300); // 5 minutes

    this.countdownInterval = setInterval(() => {
      const current = this.countdown();
      if (current > 0) {
        this.countdown.set(current - 1);
      } else {
        this.stopCountdown();
      }
    }, 1000);
  }

  /**
   * Stop countdown timer
   */
  stopCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  /**
   * Format countdown time as MM:SS
   */
  formatCountdown(): string {
    const seconds = this.countdown();
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Close dialog
   */
  close(): void {
    this.stopCountdown();
    this.resetState();
    this.visibleChange.emit(false);
  }

  /**
   * Cancel authorization
   */
  cancel(): void {
    this.close();
    this.cancelled.emit();
  }

  /**
   * Reset dialog state
   */
  resetState(): void {
    this.authCode.set('');
    this.codeRequested.set(false);
    this.error.set(null);
    this.countdown.set(0);
  }

  /**
   * Handle code input (only allow numbers, max 6 digits)
   * Auto-verify when 6 digits are entered
   */
  onCodeInput(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
    value = value.slice(0, 6); // Max 6 digits
    this.authCode.set(value);

    // Auto-verify when 6 digits are entered
    if (value.length === 6) {
      setTimeout(() => {
        this.verifyCode();
      }, 500);
    }
  }
}
