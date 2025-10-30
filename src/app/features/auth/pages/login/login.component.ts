import { Component, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

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
    FormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    CardModule,
    FloatLabelModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // Dependency Injection
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  // 🔥 SIGNALS - Estado reactivo
  readonly isLoading = signal(false);
  readonly fadeInState = signal('hidden');
  readonly slideInState = signal('hidden');
  readonly rememberMe = signal(false);
  readonly currentMessageIndex = signal(0);
  readonly isFormValid = signal(false);

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

  constructor() {
    // Initialize form
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required]], // Sin validación de email, solo required
      password: ['', [Validators.required]]
    });

    // Subscribe to form changes to update isFormValid signal
    this.loginForm.valueChanges.subscribe(() => {
      this.isFormValid.set(this.loginForm.valid);
    });

    // Subscribe to form status changes (for when form is enabled/disabled)
    this.loginForm.statusChanges.subscribe(() => {
      this.isFormValid.set(this.loginForm.valid);
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
      next: (response: any) => {
        if (response) {
          // Esperar más tiempo para asegurar que authSave() completó
          // authSave() usa requestAnimationFrame, necesitamos dar tiempo suficiente
          setTimeout(() => {
            // Verificar que el token se guardó correctamente
            const token = this.authService.getJwtToken();
            const userName = this.authService.userFullName();

            if (token) {
              this.stopLoading();

              // Mostrar mensaje de éxito
              this.messageService.add({
                severity: 'success',
                summary: '¡Bienvenido!',
                detail: userName ? `Hola ${userName}, inicio de sesión exitoso` : 'Inicio de sesión exitoso',
                life: 2000
              });

              // Navegar después de mostrar el toast
              setTimeout(() => {
                this.router.navigate(['/home']);
              }, 1000);
            } else {
              this.stopLoading();
              this.messageService.add({
                severity: 'error',
                summary: 'Error de autenticación',
                detail: 'No se pudo guardar la sesión. Por favor, intenta nuevamente.',
                life: 5000
              });
            }
          }, 500); // Incrementado de 300ms a 500ms
        } else {
          this.stopLoading();
          this.messageService.add({
            severity: 'error',
            summary: 'Error del servidor',
            detail: 'El servidor no respondió correctamente. Por favor, intenta nuevamente.',
            life: 5000
          });
        }
      },
      error: (error: any) => {
        this.stopLoading();

        // Manejo de errores específicos
        if (error.status === 401) {
          // Credenciales incorrectas
          this.messageService.add({
            severity: 'error',
            summary: 'Credenciales incorrectas',
            detail: 'Usuario o contraseña inválidos. Por favor, verifica tus credenciales.',
            life: 5000
          });
        } else if (error.status === 0 || error.status === 504) {
          // Error de conexión o timeout
          this.messageService.add({
            severity: 'error',
            summary: 'Error de conexión',
            detail: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
            life: 5000
          });
        } else if (error.status === 500) {
          // Error interno del servidor
          this.messageService.add({
            severity: 'error',
            summary: 'Error del servidor',
            detail: 'El servidor encontró un error. Por favor, intenta más tarde.',
            life: 5000
          });
        } else {
          // Error desconocido
          this.messageService.add({
            severity: 'error',
            summary: 'Error inesperado',
            detail: error.message || 'Ocurrió un error al iniciar sesión. Por favor, intenta nuevamente.',
            life: 5000
          });
        }
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
