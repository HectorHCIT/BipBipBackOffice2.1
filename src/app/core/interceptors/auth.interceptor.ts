import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Auth Interceptor - Functional (Angular 20)
 *
 * Agrega automáticamente el token JWT a todas las peticiones HTTP
 * Excepto para rutas públicas como /Login
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Rutas que NO necesitan token
  const publicRoutes = ['/Login', '/RefreshToken', '/Register'];

  // Verificar si la URL es una ruta pública
  const isPublicRoute = publicRoutes.some(route => req.url.includes(route));

  if (isPublicRoute) {
    return next(req);
  }

  // Obtener token del localStorage
  const token = localStorage.getItem('JWT_TOKEN');

  // Si no hay token, continuar sin modificar la petición
  if (!token) {
    return next(req);
  }

  // Clonar la petición y agregar el header Authorization
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
