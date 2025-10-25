---
name: primeng-angular
description: Comprehensive guide for implementing PrimeNG components in Angular projects. Use when building UI components with PrimeNG library, needing examples of forms, tables, dialogs, menus, charts, or any of the 100+ PrimeNG components. Includes patterns, best practices, and real-world use cases.
---

# PrimeNG Angular Skill

Guía completa para implementar componentes de PrimeNG en proyectos Angular. Esta skill proporciona acceso rápido a la documentación, patrones comunes y mejores prácticas para los más de 100 componentes de PrimeNG.

## Quick Start

### Instalación
```bash
npm install primeng primeicons
```

### Configuración en Angular
```typescript
// En angular.json - añadir estilos
"styles": [
  "node_modules/primeng/resources/themes/lara-light-blue/theme.css",
  "node_modules/primeng/resources/primeng.min.css",
  "node_modules/primeicons/primeicons.css",
  "src/styles.scss"
]
```

### Uso Básico (Standalone Component)
```typescript
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ButtonModule, InputTextModule],
  template: `
    <div class="flex gap-2">
      <input pInputText placeholder="Enter text" />
      <p-button label="Submit" icon="pi pi-check" />
    </div>
  `
})
export class ExampleComponent {}
```

## Encontrar Componentes

Para cualquier componente de PrimeNG, consulta el archivo `references/components.md` que contiene:
- **Lista completa** de todos los componentes organizados por categoría
- **URL de documentación oficial** para cada componente
- **Descripción breve** de funcionalidad
- **Casos de uso comunes** para cada componente

### Categorías de Componentes

1. **Form Components** (28 componentes): autocomplete, checkbox, datepicker, editor, select, etc.
2. **Button Components** (3): button, speeddial, splitbutton
3. **Data Components** (10): table, dataview, tree, timeline, paginator, etc.
4. **Panel Components** (10): accordion, card, tabs, stepper, dialog, etc.
5. **Overlay Components** (7): dialog, drawer, tooltip, confirmdialog, etc.
6. **File Components** (1): fileupload
7. **Menu Components** (8): menu, menubar, breadcrumb, contextmenu, etc.
8. **Chart Components** (1): chart
9. **Messages Components** (2): message, toast
10. **Media Components** (4): carousel, galleria, image, imagecompare
11. **Misc Components** (26): avatar, badge, progressbar, skeleton, terminal, etc.

## Workflow de Implementación

### 1. Identificar el Componente Necesario

**Pregunta al usuario** (si no está claro):
- "¿Qué funcionalidad necesitas? (ejemplo: formulario, tabla, notificaciones)"
- "¿Es para entrada de datos, visualización, o navegación?"

**Busca en references/components.md** usando el tipo de funcionalidad:
- Formularios → Form Components
- Mostrar datos → Data Components o Table
- Notificaciones → Toast/Message
- Confirmaciones → ConfirmDialog
- Navegación → Menu Components

### 2. Consultar Documentación Oficial

Una vez identificado el componente, proporciona:
```
📚 Documentación: https://primeng.org/{component-name}
```

### 3. Implementar con Patrones Comunes

Consulta `references/patterns.md` para:
- Patrones de importación correctos
- Ejemplos de uso con formularios reactivos
- Integración con servicios (MessageService, ConfirmationService)
- Mejores prácticas de performance y accesibilidad

### 4. Proporcionar Código Completo

Siempre incluye:
- ✅ Imports necesarios
- ✅ Configuración del componente (standalone o module)
- ✅ Template HTML completo
- ✅ Lógica TypeScript
- ✅ Estilos si son necesarios

## Patrones Frecuentes

### Pattern 1: Formulario Simple
```typescript
// Lee references/patterns.md sección "Formularios Reactivos con PrimeNG"
```
**Componentes usados**: InputText, Dropdown, Button, Calendar

### Pattern 2: Tabla CRUD
```typescript
// Lee references/patterns.md sección "Table con CRUD Operations"
```
**Componentes usados**: Table, Dialog, Button, InputText

### Pattern 3: Notificaciones
```typescript
// Lee references/patterns.md sección "Toast Notifications Pattern"
```
**Componentes usados**: Toast con MessageService

### Pattern 4: Confirmación de Acciones
```typescript
// Lee references/patterns.md sección "Confirm Dialog Pattern"
```
**Componentes usados**: ConfirmDialog con ConfirmationService

### Pattern 5: Wizard Multi-Paso
```typescript
// Lee references/patterns.md sección "Multi-Step Form (Stepper)"
```
**Componentes usados**: Stepper, Button, varios inputs

## Servicios Globales Importantes

### MessageService (Toast)
```typescript
providers: [MessageService]
```
Usar para: Notificaciones de éxito, error, info, warning

### ConfirmationService (ConfirmDialog)
```typescript
providers: [ConfirmationService]
```
Usar para: Confirmaciones antes de acciones destructivas

### DialogService (DynamicDialog)
```typescript
providers: [DialogService]
```
Usar para: Diálogos dinámicos con componentes personalizados

## Casos de Uso por Tipo de Proyecto

### E-commerce
- Catálogo: `DataView` + `Paginator` + `Rating`
- Carrito: `Badge` + `Table`
- Checkout: `Stepper` + varios inputs
- Detalles: `Galleria` + `Button`

### Dashboard/Analytics
- KPIs: `Card` + `Chart` + `ProgressBar`
- Reportes: `Table` con filtros y exportación
- Timeline: `Timeline` para actividades

### Admin/Backoffice
- Gestión de datos: `Table` + `Dialog` + CRUD operations
- Navegación: `Menubar` + `Breadcrumb`
- Configuración: `Accordion` + varios inputs

### CRM
- Leads/Clientes: `Table` con filtros avanzados
- Pipeline: `OrganizationChart` o custom con `Card`
- Actividades: `Timeline` + `Calendar`

## Guía Rápida de Referencias

**Cuando necesites**:
- ✅ Ver **todos los componentes disponibles** → Lee `references/components.md`
- ✅ Ver **ejemplos de código** y patrones → Lee `references/patterns.md`
- ✅ Implementar **formularios** → Lee patterns.md sección formularios
- ✅ Implementar **tablas CRUD** → Lee patterns.md sección table
- ✅ Configurar **notificaciones** → Lee patterns.md sección toast
- ✅ Conocer **mejores prácticas** → Lee patterns.md sección best practices

## Troubleshooting Común

### Estilos no se aplican
```typescript
// Verifica angular.json tenga los estilos correctos
"styles": [
  "node_modules/primeng/resources/themes/lara-light-blue/theme.css",
  "node_modules/primeng/resources/primeng.min.css",
  "node_modules/primeicons/primeicons.css"
]
```

### Componente no funciona en Standalone
```typescript
// Asegúrate de importar el módulo correcto
imports: [CommonModule, ButtonModule, InputTextModule]
```

### MessageService no funciona
```typescript
// Debe estar en providers del componente o app.config
providers: [MessageService]
```

### Tabla no muestra datos
```typescript
// Verifica que [value] esté correctamente bindeado
<p-table [value]="products"> // products debe ser un array
```

## Tips de Performance

1. **Lazy Loading**: Importa solo los módulos que necesitas
2. **Virtual Scroll**: Usa en tablas/listas con +1000 items
3. **Lazy Loading de Datos**: Implementa paginación del lado del servidor
4. **ChangeDetection**: Considera OnPush para componentes con muchos datos

## Enlaces Útiles

- 📖 Documentación oficial: https://primeng.org/
- 🎨 Showcase: https://primeng.org/showcase
- 💡 GitHub: https://github.com/primefaces/primeng
- 🎭 Theming: https://primeng.org/theming

## Workflow de Esta Skill

1. **Usuario hace pregunta** sobre implementación con PrimeNG
2. **Identificar componente(s)** necesarios consultando components.md
3. **Proporcionar URL** de documentación oficial
4. **Consultar patterns.md** para el patrón de uso similar
5. **Generar código completo** adaptado al caso del usuario
6. **Incluir mejores prácticas** de patterns.md
