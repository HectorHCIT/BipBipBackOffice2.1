import { Routes } from '@angular/router';

export const AUTOMATIC_ASSIGNMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/automatic-assignment-page/automatic-assignment-page.component').then(
        m => m.AutomaticAssignmentPageComponent
      ),
    title: 'Asignación Automática'
  }
];
