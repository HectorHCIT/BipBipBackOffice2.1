import { Routes } from '@angular/router';

export const SAC_CLIENTE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages').then((m) => m.SacClientePageComponent),
    title: 'Chats SAC-Cliente'
  }
];
