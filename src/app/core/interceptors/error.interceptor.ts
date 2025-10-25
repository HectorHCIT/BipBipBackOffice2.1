import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Error Interceptor - Functional (Angular 20)
 *
 * Maneja errores HTTP globalmente:
 * - 401: Redirige al login (token expirado/inválido)
 * - 403: Forbidden (sin permisos)
 * - 500: Error del servidor
 * - Otros: Log del error
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
        console.error('❌ Error del cliente:', errorMessage);
      } else {
        // Error del lado del servidor
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

        switch (error.status) {
          case 401:
            // Unauthorized - Token inválido o expirado
            console.error('🔒 No autorizado - Token inválido o expirado');

            // Limpiar storage
            localStorage.removeItem('JWT_TOKEN');
            localStorage.removeItem('REFRESH_TOKEN');
            localStorage.removeItem('USER');

            // Redirigir al login
            router.navigate(['/login']);
            break;

          case 403:
            // Forbidden - Sin permisos
            console.error('⛔ Acceso denegado - Sin permisos');
            // TODO: Mostrar mensaje con Toast
            break;

          case 404:
            // Not Found
            console.error('🔍 No encontrado - Recurso no existe');
            break;

          case 500:
            // Server Error
            console.error('💥 Error del servidor');
            // TODO: Mostrar mensaje con Toast
            break;

          default:
            console.error('❌ Error HTTP:', errorMessage);
        }
      }

      // Re-lanzar el error para que los componentes puedan manejarlo
      return throwError(() => error);
    })
  );
};
