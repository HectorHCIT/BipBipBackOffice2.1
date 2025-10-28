import { Routes } from '@angular/router';

/**
 * Reports Routes
 *
 * Rutas standalone para el módulo de reportes de contabilidad.
 * Todos los componentes usan lazy loading para optimizar el bundle size.
 *
 * Estado de migración:
 * ✅ invoice-details (SIMPLE)
 * ✅ cash-flow (MEDIO)
 * ✅ coupons-redeemed (COMPLEJO)
 * ✅ manual-settlements (SIMPLE)
 * ✅ cash-sales (SIMPLE)
 * ✅ not-delivery (SIMPLE)
 * ✅ pending-settlements (SIMPLE)
 * ✅ products-ranked (MEDIO - movido)
 * ✅ inactive-deliveries (SIMPLE - movido)
 * ✅ cancelled-orders (COMPLEJO)
 *
 * 🎉 MIGRACIÓN COMPLETA: 10/10 REPORTES
 */
export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'cash-flow',
    pathMatch: 'full'
  },

  // ========== REPORTES IMPLEMENTADOS ==========

  {
    path: 'invoice-details',
    loadComponent: () =>
      import('./pages/invoice-details/invoice-details.component').then(
        (m) => m.InvoiceDetailsComponent
      ),
    data: {
      title: 'Detalles de Facturas',
      breadcrumb: 'Detalles de Facturas'
    }
  },

  {
    path: 'cash-flow',
    loadComponent: () =>
      import('./pages/cash-flow/cash-flow.component').then(
        (m) => m.CashFlowComponent
      ),
    data: {
      title: 'Flujo de Efectivo',
      breadcrumb: 'Flujo de Efectivo'
    }
  },

  {
    path: 'coupons-redeemed',
    loadComponent: () =>
      import('./pages/coupons-redeemed/coupons-redeemed.component').then(
        (m) => m.CouponsRedeemedComponent
      ),
    data: {
      title: 'Cupones Canjeados',
      breadcrumb: 'Cupones Canjeados'
    }
  },

  {
    path: 'manual-settlements',
    loadComponent: () =>
      import('./pages/manual-settlements/manual-settlements.component').then(
        (m) => m.ManualSettlementsComponent
      ),
    data: {
      title: 'Liquidaciones Manuales',
      breadcrumb: 'Liquidaciones Manuales'
    }
  },

  {
    path: 'cash-sales',
    loadComponent: () =>
      import('./pages/cash-sales/cash-sales.component').then(
        (m) => m.CashSalesComponent
      ),
    data: {
      title: 'Ventas en Efectivo',
      breadcrumb: 'Ventas en Efectivo'
    }
  },

  {
    path: 'not-delivery',
    loadComponent: () =>
      import('./pages/not-delivery/not-delivery.component').then(
        (m) => m.NotDeliveryComponent
      ),
    data: {
      title: 'No Entregados',
      breadcrumb: 'No Entregados'
    }
  },

  {
    path: 'pending-settlements',
    loadComponent: () =>
      import('./pages/pending-settlements/pending-settlements.component').then(
        (m) => m.PendingSettlementsComponent
      ),
    data: {
      title: 'Liquidaciones Pendientes',
      breadcrumb: 'Liquidaciones Pendientes'
    }
  },

  {
    path: 'products-ranked',
    loadComponent: () =>
      import('./pages/products-ranked/products-ranked.component').then(
        (m) => m.ProductsRankedComponent
      ),
    data: {
      title: 'Productos Rankeados',
      breadcrumb: 'Productos Rankeados'
    }
  },

  {
    path: 'inactive-deliveries',
    loadComponent: () =>
      import('./pages/inactive-deliveries/inactive-deliveries.component').then(
        (m) => m.InactiveDeliveriesComponent
      ),
    data: {
      title: 'Deliveries Inactivos',
      breadcrumb: 'Deliveries Inactivos'
    }
  },

  {
    path: 'cancelled-orders',
    loadComponent: () =>
      import('./pages/cancelled-orders/cancelled-orders.component').then(
        (m) => m.CancelledOrdersComponent
      ),
    data: {
      title: 'Órdenes Canceladas',
      breadcrumb: 'Órdenes Canceladas'
    }
  }
];
