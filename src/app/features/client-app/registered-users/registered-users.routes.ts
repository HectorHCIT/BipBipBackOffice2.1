import { Routes } from '@angular/router';

export const REGISTERED_USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/registered-users-page/registered-users-page.component')
      .then(m => m.RegisteredUsersPageComponent),
    title: 'Usuarios Registrados'
  }
];
