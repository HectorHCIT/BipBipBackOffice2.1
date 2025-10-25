import { Routes } from '@angular/router';

/**
 * ACCOUNTING_ROUTES - Rutas consolidadas del módulo de Contabilidad
 *
 * Este archivo agrupa todas las rutas de los submódulos de Contabilidad:
 * - Companies (Empresas) - Ya migrado con Signals
 * - Document Types (Tipos de Documento) ✅
 * - Establishments (Establecimientos) - TODO
 * - Emission Points (Puntos de Emisión) - TODO
 * - Fiscal Correlatives (Correlativos Fiscales) - TODO
 * - Invoices (Facturas) - TODO
 * - Settlements (Liquidaciones) - TODO
 * - Spreadsheets (Hojas de Cálculo) - TODO
 * - Reports (Reportes) - TODO
 *
 * Estructura:
 * /accounting/companies -> CompaniesComponent
 * /accounting/document-types -> DocumentTypesComponent
 * /accounting/establishments -> EstablishmentsComponent (futuro)
 * ...etc
 *
 * IMPORTANTE: Las rutas deben mantener la nomenclatura original del backend
 * para que coincidan con los permisos que se reciben en el login.
 */
export const ACCOUNTING_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'document-types',
    pathMatch: 'full'
  },
  // TODO: Descomentar cuando se migre el módulo de Companies
  /*
  {
    path: 'companies',
    loadChildren: () => import('./companies/companies.routes').then(m => m.COMPANIES_ROUTES),
    title: 'Gestión de Empresas'
  },
  */
  {
    path: 'document-types',
    loadChildren: () => import('./document-types/document-types.routes').then(m => m.DOCUMENT_TYPES_ROUTES),
    title: 'Tipos de Documento'
  }
  // TODO: Agregar más submódulos de contabilidad aquí
  /*
  {
    path: 'establishments',
    loadChildren: () => import('./establishments/establishments.routes').then(m => m.ESTABLISHMENTS_ROUTES),
    title: 'Establecimientos'
  },
  {
    path: 'emission-points',
    loadChildren: () => import('./emission-points/emission-points.routes').then(m => m.EMISSION_POINTS_ROUTES),
    title: 'Puntos de Emisión'
  },
  {
    path: 'fiscal-correlatives',
    loadChildren: () => import('./fiscal-correlatives/fiscal-correlatives.routes').then(m => m.FISCAL_CORRELATIVES_ROUTES),
    title: 'Correlativos Fiscales'
  },
  {
    path: 'invoices',
    loadChildren: () => import('./invoices/invoices.routes').then(m => m.INVOICES_ROUTES),
    title: 'Facturas'
  },
  {
    path: 'settlements',
    loadChildren: () => import('./settlements/settlements.routes').then(m => m.SETTLEMENTS_ROUTES),
    title: 'Liquidaciones'
  },
  {
    path: 'spreadsheets',
    loadChildren: () => import('./spreadsheets/spreadsheets.routes').then(m => m.SPREADSHEETS_ROUTES),
    title: 'Hojas de Cálculo'
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.routes').then(m => m.REPORTS_ROUTES),
    title: 'Reportes'
  }
  */
];
