import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard - Functional Guard (Angular 20)
 *
 * Protege rutas que requieren autenticación
 * - Si hay token válido → permite acceso
 * - Si NO hay token → redirige a /login
 *
 * Usage:
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   canActivate: [authGuard]
 * }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (authService.isLoggedIn()) {
    return true;
  }

  // No autenticado → redirigir a login
  console.warn('🔒 Acceso denegado - Redirigiendo a login');
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};
