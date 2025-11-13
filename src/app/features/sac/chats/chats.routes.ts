import { Routes } from '@angular/router';

export const CHATS_ROUTES: Routes = [
  {
    path: 'sac-cliente',
    loadChildren: () =>
      import('./sac-cliente/sac-cliente.routes').then((m) => m.SAC_CLIENTE_ROUTES),
    title: 'Chats SAC-Cliente'
  },
  // TODO FASE 9: Agregar rutas para sac-driver
  // {
  //   path: 'sac-driver',
  //   loadChildren: () =>
  //     import('./sac-driver/sac-driver.routes').then((m) => m.SAC_DRIVER_ROUTES),
  //   title: 'Chats SAC-Driver'
  // },
  // TODO FASE 10: Agregar rutas para cliente-driver
  // {
  //   path: 'cliente-driver',
  //   loadChildren: () =>
  //     import('./cliente-driver/cliente-driver.routes').then((m) => m.CLIENTE_DRIVER_ROUTES),
  //   title: 'Chats Cliente-Driver'
  // },
  {
    path: '',
    redirectTo: 'sac-cliente',
    pathMatch: 'full'
  }
];
