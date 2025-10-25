import { Component, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';

import { AuthService } from '@core/services/auth.service';

/**
 * LoginComponent - Modernizado con Signals y PrimeNG
 *
 * Features:
 * - ✅ Standalone component
 * - ✅ Signals para estado reactivo
 * - ✅ PrimeNG components
 * - ✅ Reactive forms
 * - ✅ Animaciones CSS nativas
 */
@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    CardModule,
    FloatLabelModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // Dependency Injection
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  // 🔥 SIGNALS - Estado reactivo
  readonly isLoading = signal(false);
  readonly fadeInState = signal('hidden');
  readonly slideInState = signal('hidden');
  readonly rememberMe = signal(false);
  readonly currentMessageIndex = signal(0);

  // Form
  readonly loginForm: FormGroup;

  // Loading messages
  private readonly loadingMessages = [
    'Validando credenciales...',
    'Verificando acceso...',
    'Conectando con el servidor...',
    'Iniciando sesión...'
  ];

  // 🔥 COMPUTED - Estado derivado
  readonly loadingMessage = computed(() => {
    return this.loadingMessages[this.currentMessageIndex()];
  });

  readonly isFormValid = computed(() => {
    return this.loginForm.valid;
  });

  constructor() {
    // Initialize form
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Trigger animations after init
    setTimeout(() => {
      this.fadeInState.set('visible');
      this.slideInState.set('visible');
    }, 100);
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (!this.loginForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.startLoading();

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.stopLoading();
        if (response) {
          console.log('✅ Login exitoso');
          // TODO: Mostrar toast de éxito con PrimeNG
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 500);
        } else {
          console.error('❌ Login fallido');
          // TODO: Mostrar toast de error con PrimeNG
        }
      },
      error: (error) => {
        this.stopLoading();
        console.error('❌ Error de conexión:', error);
        // TODO: Mostrar toast de error con PrimeNG
      }
    });
  }

  /**
   * Start loading state
   */
  private startLoading(): void {
    this.isLoading.set(true);
    this.currentMessageIndex.set(0);
    this.loginForm.disable();
    this.startLoadingMessageRotation();
  }

  /**
   * Stop loading state
   */
  private stopLoading(): void {
    this.isLoading.set(false);
    this.loginForm.enable();
    this.currentMessageIndex.set(0);
  }

  /**
   * Rotate loading messages
   */
  private startLoadingMessageRotation(): void {
    const messageInterval = setInterval(() => {
      if (!this.isLoading()) {
        clearInterval(messageInterval);
        return;
      }

      const nextIndex = (this.currentMessageIndex() + 1) % this.loadingMessages.length;
      this.currentMessageIndex.set(nextIndex);
    }, 1500);
  }

  /**
   * Mark all form controls as touched
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Getters for form controls
   */
  get userName() {
    return this.loginForm.get('userName');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
