import { Routes } from '@angular/router';

export const INVOICES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/invoices/invoices.component').then(
        (m) => m.InvoicesComponent
      ),
    title: 'Facturas'
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/invoice-detail/invoice-detail.component').then(
        (m) => m.InvoiceDetailComponent
      ),
    title: 'Detalle de Factura'
  }
];
