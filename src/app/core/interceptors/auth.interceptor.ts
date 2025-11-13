import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Auth Interceptor - Functional (Angular 20)
 *
 * Agrega automáticamente el token JWT a todas las peticiones HTTP
 * Excepto para rutas públicas como /Login
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Verificar si se debe omitir el interceptor (para llamadas externas como S3)
  if (req.headers.has('Skip-Auth-Interceptor')) {
    // Eliminar el header auxiliar y continuar sin agregar Authorization
    const cleanReq = req.clone({
      headers: req.headers.delete('Skip-Auth-Interceptor')
    });
    return next(cleanReq);
  }

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
