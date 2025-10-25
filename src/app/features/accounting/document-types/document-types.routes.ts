import { Routes } from '@angular/router';

/**
 * DOCUMENT_TYPES_ROUTES - Rutas del módulo de Tipos de Documento
 *
 * Ruta base: /accounting/document-types
 */
export const DOCUMENT_TYPES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/document-types/document-types.component').then(
        (m) => m.DocumentTypesComponent
      ),
    title: 'Tipos de Documento'
  }
];
