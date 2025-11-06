import { Routes } from '@angular/router';

export const FAQS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/faqs-page/faqs-page.component')
      .then(m => m.FaqsPageComponent),
    title: 'Preguntas Frecuentes'
  }
];
