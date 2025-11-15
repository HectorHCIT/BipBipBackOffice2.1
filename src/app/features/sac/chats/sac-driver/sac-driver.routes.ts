import { Routes } from '@angular/router';

export const SAC_DRIVER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages').then((m) => m.SacDriverPageComponent),
    title: 'Chats SAC-Driver'
  }
];
