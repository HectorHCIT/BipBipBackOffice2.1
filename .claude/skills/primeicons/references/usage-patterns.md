# PrimeIcons Usage Patterns & Examples

## Instalación y Configuración

### Instalación
```bash
npm install primeicons
```

### Importar en Angular
```typescript
// En angular.json
"styles": [
  "node_modules/primeicons/primeicons.css"
]

// O en styles.scss
@import "primeicons/primeicons.css";
```

## Uso Básico

### HTML Standalone
```html
<!-- Sintaxis básica: pi pi-{icon-name} -->
<i class="pi pi-check"></i>
<i class="pi pi-times"></i>
<span class="pi pi-search"></span>
<span class="pi pi-user"></span>
```

### Con Tamaño Personalizado
```html
<i class="pi pi-check" style="font-size: 1rem"></i>
<i class="pi pi-times" style="font-size: 1.5rem"></i>
<i class="pi pi-search" style="font-size: 2rem"></i>
<i class="pi pi-user" style="font-size: 2.5rem"></i>
```

### Con Color Personalizado
```html
<i class="pi pi-check" style="color: slateblue"></i>
<i class="pi pi-times" style="color: green"></i>
<i class="pi pi-search" style="color: var(--primary-color)"></i>
<i class="pi pi-user" style="color: #708090"></i>
```

### Animación de Rotación (Spin)
```html
<!-- Para indicadores de carga -->
<i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
<i class="pi pi-spin pi-cog" style="font-size: 2rem"></i>
```

## Uso en Componentes PrimeNG

### Botones
```html
<!-- Con icono solo -->
<p-button icon="pi pi-check" />

<!-- Con icono y label -->
<p-button label="Save" icon="pi pi-save" />

<!-- Icono a la derecha -->
<p-button label="Next" icon="pi pi-arrow-right" iconPos="right" />

<!-- Botón con icono solo (redondeado) -->
<p-button icon="pi pi-pencil" [rounded]="true" />
```

### Menú Items
```typescript
import { MenuItem } from 'primeng/api';

items: MenuItem[] = [
  {
    label: 'New',
    icon: 'pi pi-plus',
    command: () => { this.create(); }
  },
  {
    label: 'Edit',
    icon: 'pi pi-pencil',
    command: () => { this.edit(); }
  },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    command: () => { this.delete(); }
  },
  {
    separator: true
  },
  {
    label: 'Export',
    icon: 'pi pi-download',
    items: [
      { label: 'PDF', icon: 'pi pi-file-pdf' },
      { label: 'Excel', icon: 'pi pi-file-excel' }
    ]
  }
];
```

### Tabs con Iconos
```html
<p-tabView>
  <p-tabPanel header="Dashboard" leftIcon="pi pi-home">
    <p>Dashboard content</p>
  </p-tabPanel>
  <p-tabPanel header="Settings" leftIcon="pi pi-cog">
    <p>Settings content</p>
  </p-tabPanel>
  <p-tabPanel header="Profile" leftIcon="pi pi-user">
    <p>Profile content</p>
  </p-tabPanel>
</p-tabView>
```

### Toast/Message con Iconos
```typescript
// Los iconos se aplican automáticamente según severity
this.messageService.add({
  severity: 'success', // icono: pi-check-circle
  summary: 'Success',
  detail: 'Record saved'
});

this.messageService.add({
  severity: 'info', // icono: pi-info-circle
  summary: 'Info',
  detail: 'Information message'
});

this.messageService.add({
  severity: 'warn', // icono: pi-exclamation-triangle
  summary: 'Warning',
  detail: 'Warning message'
});

this.messageService.add({
  severity: 'error', // icono: pi-times-circle
  summary: 'Error',
  detail: 'Error message'
});

// Icono personalizado
this.messageService.add({
  severity: 'custom',
  summary: 'Custom',
  detail: 'Custom message',
  icon: 'pi pi-star'
});
```

### Input con Iconos (IconField)
```html
<p-iconfield iconPosition="left">
  <p-inputicon styleClass="pi pi-search" />
  <input type="text" pInputText placeholder="Search" />
</p-iconfield>

<p-iconfield iconPosition="right">
  <p-inputicon styleClass="pi pi-envelope" />
  <input type="text" pInputText placeholder="Email" />
</p-iconfield>
```

### Badge con Iconos
```html
<p-button icon="pi pi-bell" [badge]="'3'" badgeClass="p-badge-danger" />
<p-button icon="pi pi-shopping-cart" [badge]="cartCount.toString()" />
<p-button icon="pi pi-envelope" [badge]="'5'" badgeClass="p-badge-info" />
```

### SpeedDial
```typescript
items: MenuItem[] = [
  {
    icon: 'pi pi-pencil',
    command: () => { this.edit(); }
  },
  {
    icon: 'pi pi-refresh',
    command: () => { this.refresh(); }
  },
  {
    icon: 'pi pi-trash',
    command: () => { this.delete(); }
  },
  {
    icon: 'pi pi-upload',
    command: () => { this.upload(); }
  }
];
```

```html
<p-speeddial [model]="items" direction="up" />
```

## Uso con Constantes TypeScript

### Importar PrimeIcons
```typescript
import { PrimeIcons } from 'primeng/api';
```

### En Menús
```typescript
@Component({
  selector: 'app-menu',
  template: `<p-menu [model]="items" />`
})
export class MenuComponent implements OnInit {
  items: MenuItem[];

  ngOnInit() {
    this.items = [
      {
        label: 'File',
        icon: PrimeIcons.FILE,
        items: [
          {
            label: 'New',
            icon: PrimeIcons.PLUS,
            shortcut: '⌘+N'
          },
          {
            label: 'Open',
            icon: PrimeIcons.FOLDER_OPEN,
            shortcut: '⌘+O'
          },
          {
            label: 'Save',
            icon: PrimeIcons.SAVE,
            shortcut: '⌘+S'
          }
        ]
      },
      {
        label: 'Edit',
        icon: PrimeIcons.PENCIL,
        items: [
          {
            label: 'Copy',
            icon: PrimeIcons.COPY
          },
          {
            label: 'Delete',
            icon: PrimeIcons.TRASH
          }
        ]
      }
    ];
  }
}
```

### En Componentes Dinámicos
```typescript
export class DynamicIconsComponent {
  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'success': PrimeIcons.CHECK_CIRCLE,
      'error': PrimeIcons.TIMES_CIRCLE,
      'warning': PrimeIcons.EXCLAMATION_TRIANGLE,
      'info': PrimeIcons.INFO_CIRCLE,
      'pending': PrimeIcons.CLOCK
    };
    return iconMap[status] || PrimeIcons.CIRCLE;
  }

  getActionIcon(action: string): string {
    const iconMap: { [key: string]: string } = {
      'edit': PrimeIcons.PENCIL,
      'delete': PrimeIcons.TRASH,
      'view': PrimeIcons.EYE,
      'download': PrimeIcons.DOWNLOAD,
      'print': PrimeIcons.PRINT
    };
    return iconMap[action];
  }
}
```

## Patrones de Uso Comunes

### Botones de Acción en Tabla
```html
<p-table [value]="products">
  <ng-template pTemplate="body" let-product>
    <tr>
      <td>{{product.name}}</td>
      <td>
        <div class="flex gap-2">
          <p-button 
            icon="pi pi-eye" 
            [rounded]="true" 
            [text]="true"
            severity="info"
            (onClick)="viewProduct(product)"
            pTooltip="View"
          />
          <p-button 
            icon="pi pi-pencil" 
            [rounded]="true" 
            [text]="true"
            severity="success"
            (onClick)="editProduct(product)"
            pTooltip="Edit"
          />
          <p-button 
            icon="pi pi-trash" 
            [rounded]="true" 
            [text]="true"
            severity="danger"
            (onClick)="deleteProduct(product)"
            pTooltip="Delete"
          />
        </div>
      </td>
    </tr>
  </ng-template>
</p-table>
```

### Header con Acciones
```html
<div class="flex justify-content-between align-items-center mb-4">
  <h2>
    <i class="pi pi-users mr-2"></i>
    Users Management
  </h2>
  <div class="flex gap-2">
    <p-button 
      label="Export" 
      icon="pi pi-download" 
      [outlined]="true"
    />
    <p-button 
      label="New User" 
      icon="pi pi-plus"
    />
  </div>
</div>
```

### Estado de Carga
```typescript
@Component({
  template: `
    <div *ngIf="loading" class="flex justify-content-center align-items-center p-4">
      <i class="pi pi-spin pi-spinner" style="font-size: 3rem; color: var(--primary-color)"></i>
      <span class="ml-3">Loading...</span>
    </div>
    
    <div *ngIf="!loading">
      <!-- Contenido -->
    </div>
  `
})
export class LoadingComponent {
  loading = false;
}
```

### Indicadores de Estado
```html
<p-tag 
  [value]="status.label" 
  [icon]="status.icon" 
  [severity]="status.severity"
/>
```

```typescript
getStatusConfig(status: string) {
  const configs = {
    'active': { 
      label: 'Active', 
      icon: PrimeIcons.CHECK_CIRCLE, 
      severity: 'success' 
    },
    'inactive': { 
      label: 'Inactive', 
      icon: PrimeIcons.TIMES_CIRCLE, 
      severity: 'danger' 
    },
    'pending': { 
      label: 'Pending', 
      icon: PrimeIcons.CLOCK, 
      severity: 'warning' 
    }
  };
  return configs[status];
}
```

### Búsqueda y Filtros
```html
<div class="p-inputgroup">
  <span class="p-inputgroup-addon">
    <i class="pi pi-search"></i>
  </span>
  <input 
    type="text" 
    pInputText 
    placeholder="Search..." 
    [(ngModel)]="searchText"
  />
  <p-button 
    icon="pi pi-filter" 
    (onClick)="showFilters()"
  />
</div>
```

### Rating con Estrellas
```html
<p-rating 
  [(ngModel)]="rating" 
  [cancel]="false"
  iconOnClass="pi pi-star-fill"
  iconOffClass="pi pi-star"
/>
```

### Toggle de Tema Oscuro
```html
<p-button 
  [icon]="darkMode ? 'pi pi-sun' : 'pi pi-moon'" 
  (onClick)="toggleTheme()"
  [rounded]="true"
  [text]="true"
/>
```

### Breadcrumb
```typescript
items: MenuItem[] = [
  { label: 'Home', icon: PrimeIcons.HOME, routerLink: '/' },
  { label: 'Products', icon: PrimeIcons.SHOPPING_CART, routerLink: '/products' },
  { label: 'Details', icon: PrimeIcons.INFO_CIRCLE }
];
```

### Pasos de Wizard
```html
<p-steps [model]="steps" [activeIndex]="activeStep">
</p-steps>
```

```typescript
steps: MenuItem[] = [
  { label: 'Personal Info', icon: PrimeIcons.USER },
  { label: 'Contact', icon: PrimeIcons.ENVELOPE },
  { label: 'Address', icon: PrimeIcons.MAP_MARKER },
  { label: 'Confirmation', icon: PrimeIcons.CHECK }
];
```

## Mejores Prácticas

### 1. Usa Constantes en Lugar de Strings
```typescript
// ❌ Evitar
icon: 'pi pi-check'

// ✅ Preferir
icon: PrimeIcons.CHECK
```

### 2. Agrupa Iconos Relacionados
```typescript
export const ACTION_ICONS = {
  CREATE: PrimeIcons.PLUS,
  EDIT: PrimeIcons.PENCIL,
  DELETE: PrimeIcons.TRASH,
  VIEW: PrimeIcons.EYE,
  DOWNLOAD: PrimeIcons.DOWNLOAD
} as const;

export const STATUS_ICONS = {
  SUCCESS: PrimeIcons.CHECK_CIRCLE,
  ERROR: PrimeIcons.TIMES_CIRCLE,
  WARNING: PrimeIcons.EXCLAMATION_TRIANGLE,
  INFO: PrimeIcons.INFO_CIRCLE
} as const;
```

### 3. Considera la Accesibilidad
```html
<!-- Agrega aria-label para screen readers -->
<p-button 
  icon="pi pi-pencil" 
  [rounded]="true"
  aria-label="Edit item"
/>

<!-- Usa tooltip para contexto visual -->
<p-button 
  icon="pi pi-trash" 
  [rounded]="true"
  pTooltip="Delete item"
/>
```

### 4. Tamaños Consistentes
```scss
// Define variables para tamaños de iconos
:root {
  --icon-size-sm: 0.875rem;
  --icon-size-md: 1rem;
  --icon-size-lg: 1.5rem;
  --icon-size-xl: 2rem;
}

.icon-sm { font-size: var(--icon-size-sm); }
.icon-md { font-size: var(--icon-size-md); }
.icon-lg { font-size: var(--icon-size-lg); }
.icon-xl { font-size: var(--icon-size-xl); }
```

### 5. Colores Semánticos
```scss
.icon-success { color: var(--green-500); }
.icon-danger { color: var(--red-500); }
.icon-warning { color: var(--yellow-500); }
.icon-info { color: var(--blue-500); }
```

## Casos de Uso por Industria

### E-commerce
```typescript
const ECOMMERCE_ICONS = {
  CART: PrimeIcons.SHOPPING_CART,
  WISHLIST: PrimeIcons.HEART,
  PRODUCT: PrimeIcons.BOX,
  PAYMENT: PrimeIcons.CREDIT_CARD,
  SHIPPING: PrimeIcons.TRUCK,
  ORDER: PrimeIcons.RECEIPT,
  DISCOUNT: PrimeIcons.PERCENTAGE
};
```

### Dashboard/Analytics
```typescript
const DASHBOARD_ICONS = {
  CHART: PrimeIcons.CHART_LINE,
  PIE_CHART: PrimeIcons.CHART_PIE,
  BAR_CHART: PrimeIcons.CHART_BAR,
  TRENDS: PrimeIcons.ARROW_UP,
  METRICS: PrimeIcons.CHART_SCATTER,
  REPORT: PrimeIcons.FILE
};
```

### Admin Panel
```typescript
const ADMIN_ICONS = {
  USERS: PrimeIcons.USERS,
  SETTINGS: PrimeIcons.COG,
  SECURITY: PrimeIcons.SHIELD,
  DATABASE: PrimeIcons.DATABASE,
  LOGS: PrimeIcons.HISTORY,
  PERMISSIONS: PrimeIcons.LOCK
};
```

### Social Media
```typescript
const SOCIAL_ICONS = {
  LIKE: PrimeIcons.THUMBS_UP,
  COMMENT: PrimeIcons.COMMENT,
  SHARE: PrimeIcons.SHARE_ALT,
  FOLLOW: PrimeIcons.USER_PLUS,
  MESSAGE: PrimeIcons.ENVELOPE,
  NOTIFICATION: PrimeIcons.BELL
};
```
