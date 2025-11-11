import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'reporte-asignaciones',
    pathMatch: 'full'
  },
  {
    path: 'reporte-asignaciones',
    loadChildren: () =>
      import('./assignments-report/assignments-report.routes').then(
        (m) => m.ASSIGNMENTS_REPORT_ROUTES
      ),
    title: 'SAC - Reporte de Asignaciones'
  },
  {
    path: 'reporte-control-beneficios',
    loadChildren: () =>
      import('./benefits-report/benefits-report.routes').then(
        (m) => m.BENEFITS_REPORT_ROUTES
      ),
    title: 'SAC - Reporte de Control de Beneficios'
  },
  {
    path: 'reporte-chats',
    loadChildren: () =>
      import('./chat-report/chat-report.routes').then(
        (m) => m.CHAT_REPORT_ROUTES
      ),
    title: 'SAC - Reporte de Chats'
  },
  {
    path: 'reporte-detalle-chats',
    loadChildren: () =>
      import('./chat-details-report/chat-details-report.routes').then(
        (m) => m.CHAT_DETAILS_REPORT_ROUTES
      ),
    title: 'SAC - Reporte de Detalle de Chats'
  },
  {
    path: 'reporte-tiempo-entrega',
    loadChildren: () =>
      import('./delivery-time-report/delivery-time-report.routes').then(
        (m) => m.DELIVERY_TIME_REPORT_ROUTES
      ),
    title: 'SAC - Reporte de Tiempo de Entrega'
  },
  {
    path: 'reporte-incidencias',
    loadChildren: () =>
      import('./occurrences-report/occurrences-report.routes').then(
        (m) => m.OCCURRENCES_REPORT_ROUTES
      ),
    title: 'SAC - Reporte de Ocurrencias'
  }
];
