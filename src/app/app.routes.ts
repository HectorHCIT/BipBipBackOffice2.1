import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Auth routes (sin layout, sin guard)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
  },

  // Protected routes (con layout y guard)
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./features/home/pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'dashboard',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      // Mantenimiento (Maintenance)
      {
        path: 'maintenance',
        loadChildren: () => import('./features/maintenance/maintenance.routes').then(m => m.MAINTENANCE_ROUTES)
      }
      // TODO: Agregar más módulos padre aquí (SAC, App Clientes, Drivers, etc.)
    ]
  },

  // Catch all - redirect to home
  {
    path: '**',
    redirectTo: ''
  }
];
