import { Routes } from '@angular/router';

export const credentialsPermissionsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/credentials-permissions/credentials-permissions-page.component').then(
        m => m.CredentialsPermissionsPageComponent
      ),
    data: {
      title: 'Credenciales y Permisos'
    }
  }
];
