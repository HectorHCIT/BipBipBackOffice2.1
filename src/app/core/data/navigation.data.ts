import { NavigationItem } from '../models/auth.model';

/**
 * Mapeo de iconos SVG custom a PrimeIcons
 * Convierte los nombres de iconos del proyecto viejo a iconos de PrimeNG
 */
export const ICON_MAP: Record<string, string> = {
  'home': 'pi pi-home',
  'dashb': 'pi pi-chart-bar',
  'headphone': 'pi pi-headphones',
  'user': 'pi pi-user',
  'chat-info': 'pi pi-bell',
  'car': 'pi pi-car',
  'shop': 'pi pi-building',
  'setting': 'pi pi-cog',
  'money': 'pi pi-dollar',
  'note-warning': 'pi pi-exclamation-triangle',
  'shop_bag': 'pi pi-shopping-bag'
};

/**
 * Convierte un nombre de icono SVG a PrimeIcon
 */
function mapIcon(svgIcon?: string): string | undefined {
  if (!svgIcon) return undefined;
  return ICON_MAP[svgIcon] || 'pi pi-circle';
}

/**
 * Datos de navegación completos del sistema
 * Fuente: Migrado desde old/src/app/core/layout/common/navigation/data.ts
 *
 * IMPORTANTE: Este es el array completo de todas las rutas del sistema.
 * Las rutas visibles para cada usuario se filtran según los permisos
 * que retorna el backend en el login (modules) y Firebase.
 */
export const navigationData: NavigationItem[] = [
  {
    id: 1,
    title: 'Inicio',
    type: 'basic',
    link: '/home',
    icon: mapIcon('home'),
  },
  {
    id: 2,
    title: 'Dashboards',
    type: 'collapsable',
    link: '/dashboards',
    icon: mapIcon('dashb'),
    unfolded: false,
    children: [
      {
        id: 25,
        title: 'Cancelaciones',
        type: 'basic',
        link: '/dashboards/cancelations',
      },
      {
        id: 22,
        title: 'Clientes',
        type: 'basic',
        link: '/dashboards/customers',
      },
      {
        id: 24,
        title: 'Deliveries',
        type: 'basic',
        link: '/dashboards/deliveries',
      },
      {
        id: 26,
        title: 'KPI APP Mobile',
        type: 'basic',
        link: '/dashboards/kpi-bipbip',
      },
      {
        id: 23,
        title: 'KPI Chats',
        type: 'basic',
        link: '/dashboards/kpi-chats',
      },
      {
        id: 21,
        title: 'Ordenes',
        type: 'basic',
        link: '/dashboards/orders',
      },
      {
        id: 27,
        title: 'Promociones',
        type: 'basic',
        link: '/dashboards/promotions',
      },
      {
        id: 28,
        title: 'Loyalty',
        type: 'basic',
        link: '/dashboards/Loyalty',
      },
    ],
  },
  {
    id: 3,
    title: 'Sac',
    type: 'collapsable',
    link: '/sac',
    icon: mapIcon('headphone'),
    unfolded: false,
    children: [
      {
        id: 31,
        title: 'Chats',
        link: '/sac/chats',
        unfolded: false,
        children: [
          {
            id: 311,
            title: 'Ajustes SAC',
            link: '/sac/chats/SAC-config',
          },
          {
            id: 312,
            title: 'Cliente y Driver',
            link: '/sac/chats',
          },
          {
            id: 313,
            title: 'SAC y Cliente',
            link: '/sac/chats/sac-cliente',
          },
          {
            id: 314,
            title: 'SAC y Driver',
            link: '/sac/chats/sac-driver',
          },
          {
            id: 315,
            title: 'Historial de Chats',
            link: '/sac/chats/history',
          },
          {
            id: 316,
            title: 'Historial de Agentes',
            link: '/sac/chats/agent-history',
          },
        ],
      },
      {
        id: 32,
        title: 'Ordenes con demora',
        type: 'basic',
        link: '/sac/ordenes-con-demora',
      },
      {
        id: 33,
        title: 'Ordenes Programadas',
        type: 'basic',
        link: '/sac/scheduled-orders',
      },
      {
        id: 34,
        title: 'Seguimiento pedidos',
        link: '/sac/order-tracking',
      },
      {
        id: 35,
        title: 'Solicitud de cancelaciones',
        link: '/sac/cancellation-request',
      },
      {
        id: 36,
        title: 'Incidencias / Ocurrencias',
        link: '/sac/ocurrences',
      },
      {
        id: 37,
        title: 'Ordenes por cliente',
        link: '/sac/order-customer',
      },
      {
        id: 27,
        title: 'Reportes',
        link: '/sac/reportes',
        unfolded: false,
        children: [
          {
            id: 271,
            title: 'Reporte de Asignaciones',
            link: '/sac/reportes/reporte-asignaciones',
          },
          {
            id: 272,
            title: 'Reporte de Incidencias/Ocurrencias',
            link: '/sac/reportes/reporte-incidencias',
          },
          {
            id: 273,
            title: 'Reporte de Chats',
            link: '/sac/reportes/reporte-chats',
          },
          {
            id: 274,
            title: 'Reporte Detalle Chats',
            link: '/sac/reportes/reporte-detalle-chats',
          },
          {
            id: 275,
            title: 'Reporte Control Beneficios',
            link: '/sac/reportes/reporte-control-beneficios',
          },
          {
            id: 276,
            title: 'Reporte Tiempo Entrega',
            link: '/sac/reportes/reporte-tiempo-entrega',
          },
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'App Clientes',
    type: 'collapsable',
    link: '/client-app',
    icon: mapIcon('user'),
    unfolded: false,
    children: [
      {
        id: 45,
        title: 'Gestión de canales',
        link: '/client-app/channels',
      },
      {
        id: 42,
        title: 'Notificaciones SMS y Push',
        link: '/client-app/sms-push-notifications',
      },
      {
        id: 43,
        title: 'Preguntas frecuentes',
        link: '/client-app/frequently-question',
      },
      {
        id: 44,
        title: 'Propinas',
        link: '/client-app/gratification',
      },
      {
        id: 41,
        title: 'Usuarios registrados',
        link: '/client-app/user-registry',
      },
    ],
  },
  {
    id: 5,
    title: 'Gest. Notificaciones',
    type: 'collapsable',
    link: '/notification-managements',
    icon: mapIcon('chat-info'),
    unfolded: false,
    children: [
      {
        id: 51,
        title: 'Métodos de pago',
        type: 'basic',
        link: '/notification-managements/payment-methods',
      },
      {
        id: 52,
        title: 'Programa de lealtad',
        type: 'basic',
        link: '/notification-managements/loyalty-program',
      },
      {
        id: 53,
        title: 'Promociones en App',
        type: 'basic',
        link: '/notification-managements/in-app-promotions',
      },
      {
        id: 54,
        title: 'Públicos objetivos',
        type: 'basic',
        link: '/notification-managements/objective-public',
      },
      {
        id: 55,
        title: 'App-Link',
        type: 'basic',
        link: '/notification-managements/app-link',
      },
      {
        id: 56,
        title: 'Push In App',
        type: 'basic',
        link: '/notification-managements/push-in-app',
      },
      {
        id: 57,
        title: 'Productos en Promoción',
        type: 'basic',
        link: '/notification-managements/products-in-promotions',
      },
      {
        id: 58,
        title: 'Alertas Personalizadas',
        type: 'basic',
        link: '/notification-managements/custom-alerts',
      },
    ],
  },
  {
    id: 6,
    title: 'App Drivers',
    type: 'collapsable',
    link: '/driver-app',
    icon: mapIcon('car'),
    unfolded: false,
    children: [
      {
        id: 61,
        title: 'Bases de operaciones',
        type: 'basic',
        link: '/driver-app/operation-bases',
      },
      {
        id: 62,
        title: 'Drivers registrados',
        type: 'basic',
        link: '/driver-app/registered-users-drivers',
      },
      {
        id: 63,
        title: 'Formularios de registro',
        type: 'basic',
        link: '/driver-app/registration-forms',
      },
    ],
  },
  {
    id: 7,
    title: 'Restaurantes',
    type: 'collapsable',
    link: '/restaurants',
    icon: mapIcon('shop'),
    unfolded: false,
    children: [
      {
        id: 71,
        title: 'Restaurante',
        type: 'basic',
        link: '/restaurants/restaurant',
      },
    ],
  },
  {
    id: 8,
    title: 'Mantenimientos',
    type: 'collapsable',
    link: '/maintenance',
    icon: mapIcon('setting'),
    unfolded: false,
    children: [
      {
        id: 81,
        title: 'App Configuraciones',
        type: 'basic',
        link: '/maintenance/app-configuration',
      },
      {
        id: 82,
        title: 'Asignación automatíca',
        type: 'basic',
        link: '/maintenance/automatic-assignment',
      },
      {
        id: 83,
        title: 'Credenciales y permisos',
        type: 'basic',
        link: '/maintenance/credentials-and-permissions',
      },
      {
        id: 84,
        title: 'Marcas',
        type: 'basic',
        link: '/maintenance/brands',
      },
      {
        id: 85,
        title: 'Monedas y paises',
        type: 'basic',
        link: '/maintenance/currencies-and-countries',
      },
      {
        id: 86,
        title: 'Precios por Kilómetro (Delivery\'s)',
        type: 'basic',
        link: '/maintenance/prices-per-kilometer-delivery',
      },
       {
        id: 87,
        title: 'Pagos diferenciados',
        type: 'basic',
        link: '/maintenance/differentiated-payment',
      },
    ],
  },
  {
    id: 9,
    title: 'Contabilidad',
    type: 'collapsable',
    link: '/accounting',
    icon: mapIcon('money'),
    unfolded: false,
    children: [
      {
        id: 91,
        title: 'Correlativos fiscales',
        type: 'basic',
        link: '/accounting/fiscal-correlatives',
      },
      {
        id: 92,
        title: 'Empresas',
        type: 'basic',
        link: '/accounting/companies',
      },
      {
        id: 93,
        title: 'Establecimientos',
        type: 'basic',
        link: '/accounting/establishments',
      },
      {
        id: 94,
        title: 'Facturas',
        type: 'basic',
        link: '/accounting/invoices',
      },
      {
        id: 95,
        title: 'Liquidaciones',
        type: 'basic',
        link: '/accounting/settlements',
      },
      {
        id: 96,
        title: 'Planillas',
        type: 'collapsable',
        link: '/accounting/spreadsheets',
        unfolded: false,
        children: [
          {
            id: 961,
            title: 'Correlativo Planilla',
            type: 'basic',
            link: '/accounting/spreadsheets/planilla-correlativo',
          },
          {
            id: 962,
            title: 'Liq. por Restaurante',
            type: 'basic',
            link: '/accounting/spreadsheets/liquidacion-restaurante',
          },
          {
            id: 963,
            title: 'Pagos a Drivers',
            type: 'basic',
            link: '/accounting/spreadsheets/driver-payments',
          },
          {
            id: 964,
            title: 'Planilla por Base de Ope.',
            type: 'basic',
            link: '/accounting/spreadsheets/planilla-base-operaciones',
          },
          {
            id: 965,
            title: 'Reporte Alimentación Deliveries',
            type: 'basic',
            link: '/accounting/spreadsheets/reporte-alimentacion-deliveries',
          },
          {
            id: 966,
            title: 'Reporte Comandas Por Delivery',
            type: 'basic',
            link: '/accounting/spreadsheets/reporte-comandas-delivery',
          },
          {
            id: 967,
            title: 'Reporte Liquidaciones Delivery',
            type: 'basic',
            link: '/accounting/spreadsheets/reporte-liquidaciones-delivery',
          },
          {
            id: 968,
            title: 'Ajuste de Planilla',
            type: 'basic',
            link: '/accounting/spreadsheets/payroll-adjustment',
          },
          {
            id: 969,
            title: 'Premiaciones',
            type: 'basic',
            link: '/accounting/spreadsheets/awards',
          }
        ],
      },
      {
        id: 97,
        title: 'Punto de emisión',
        type: 'basic',
        link: '/accounting/emission-points',
      },
      {
        id: 98,
        title: 'Reportes',
        type: 'collapsable',
        link: '/accounting/reports',
        unfolded: false,
        children: [
          {
            id: 981,
            title: 'Detalles de Factura',
            link: '/accounting/reports/invoice-details',
          },
          {
            id: 982,
            title: 'Flujo de Efectivo',
            link: '/accounting/reports/cash-flow',
          },
          {
            id: 983,
            title: 'Liquidaciones Manuales',
            link: '/accounting/reports/manual-settlements',
          },
          {
            id: 984,
            title: 'Liquidaciones Pendientes',
            link: '/accounting/reports/pending-settlements',
          },
          {
            id: 985,
            title: 'No Entregadas',
            link: '/accounting/reports/not-delivery',
          },
          {
            id: 986,
            title: 'Órdenes Canceladas',
            link: '/accounting/reports/cancelled-orders',
          },
          {
            id: 987,
            title: 'Ventas Efectivo',
            link: '/accounting/reports/cash-sales',
          },
          {
            id: 988,
            title: 'Productos mas vendidos',
            link: '/accounting/reports/products-ranked',
          },
          {
            id: 989,
            title: 'Cupones Canjeados',
            link: '/accounting/reports/coupons-redeemed',
          },
          {
            id: 990,
            title: 'Deliveries Inactivos',
            link: '/accounting/reports/inactive-deliveries',
          },
        ],
      },
      {
        id: 99,
        title: 'Tipo de documento',
        type: 'basic',
        link: '/accounting/document-types',
      },
      {
        id: 910,
        title: 'Reportes de transacciones',
        type: 'basic',
        link: '/accounting/transaction-reports',
      },
    ],
  },
  {
    id: 10,
    title: 'Contingencias',
    type: 'collapsable',
    link: '/contingencies',
    icon: mapIcon('note-warning'),
    unfolded: false,
    children: [
      {
        id: 101,
        title: 'Monitoreo Signal/Redis',
        type: 'basic',
        link: '/contingencies/signal-monitoring',
      },
      {
        id: 102,
        title: 'SAAO',
        type: 'basic',
        link: '/contingencies/saao',
      },
    ],
  },
  {
    id: 11,
    title: 'Reportes',
    type: 'collapsable',
    link: '/report',
    icon: 'pi pi-file-pdf',
    unfolded: false,
    children: [
      {
        id: 111,
        title: 'Reportes de deliveries',
        type: 'basic',
        link: '/report/deliveries',
      },
    ],
  },
  {
    id: 12,
    title: 'Comercios',
    type: 'collapsable',
    link: '/commerce',
    icon: mapIcon('shop_bag'),
    unfolded: false,
    children: [
      {
        id: 121,
        title: 'Construir Menú',
        type: 'basic',
        link: '/commerce/create-commerce',
      },
      {
        id: 122,
        title: 'Mi Menú',
        type: 'basic',
        link: '/commerce/menu',
      },
      {
        id: 124,
        title: 'Menú Por Restaurantes',
        type: 'basic',
        link: '/commerce/restaurant-restrictions',
      },
    ],
  },
];
