---
name: primeicons
description: Complete guide for using PrimeIcons in Angular with PrimeNG. Use when needing icon references, looking for specific icons by category (arrows, actions, social media, etc.), implementing icons in buttons/menus/UI elements, or needing examples of icon usage patterns. Includes 250+ icons with TypeScript constants.
---

# PrimeIcons Skill

Guía completa para usar PrimeIcons, la librería oficial de iconos de PrimeNG con más de 250 iconos open source.

## Quick Start

### Instalación
```bash
npm install primeicons
```

### Configuración
```typescript
// En angular.json
"styles": [
  "node_modules/primeicons/primeicons.css"
]

// O en styles.scss
@import "primeicons/primeicons.css";
```

### Uso Básico
```html
<!-- Sintaxis: pi pi-{icon-name} -->
<i class="pi pi-check"></i>
<i class="pi pi-times"></i>
<span class="pi pi-search"></span>
```

### Con PrimeNG Buttons
```html
<p-button label="Save" icon="pi pi-save" />
<p-button icon="pi pi-pencil" [rounded]="true" />
```

### Con Constantes TypeScript
```typescript
import { PrimeIcons } from 'primeng/api';

// ✅ Preferir constantes
icon: PrimeIcons.SAVE  // en lugar de 'pi pi-save'
```

## Encontrar Iconos

### Por Categoría
Consulta `references/icons-list.md` para ver la lista completa organizada en categorías:

1. **Arrows & Navigation** (40+ iconos): angle-down, chevron-right, arrow-left, caret-up, etc.
2. **Actions & Controls** (35+ iconos): plus, minus, check, trash, save, copy, lock, etc.
3. **File & Folder** (15+ iconos): file, folder, cloud-download, upload, file-pdf, etc.
4. **Media & Player** (20+ iconos): play, pause, camera, video, volume, microphone, etc.
5. **Communication** (10+ iconos): phone, envelope, send, comment, whatsapp, telegram, etc.
6. **User & Profile** (8+ iconos): user, user-plus, users, id-card, address-book, etc.
7. **E-commerce** (20+ iconos): shopping-cart, credit-card, dollar, tag, gift, barcode, etc.
8. **UI & Layout** (25+ iconos): table, list, bars, align-center, desktop, mobile, etc.
9. **Status & Indicators** (30+ iconos): spinner, star, flag, heart, bell, bookmark, etc.
10. **Time & Calendar** (8+ iconos): calendar, clock, stopwatch, history, etc.
11. **Location** (5+ iconos): map, map-marker, compass, globe, etc.
12. **Search & Filter** (25+ iconos): search, filter, sort variants, etc.
13. **Settings** (6+ iconos): cog, sliders, wrench, hammer, bolt, etc.
14. **Charts & Data** (6+ iconos): chart-bar, chart-line, chart-pie, database, etc.
15. **Text Formatting** (10+ iconos): bold, italic, underline, link, eraser, etc.
16. **Social Media** (20+ iconos): facebook, twitter, instagram, linkedin, youtube, etc.
17. **Miscellaneous** (40+ iconos): home, book, calculator, key, trophy, wifi, etc.

### Búsqueda Online
- **URL**: https://primeng.org/icons
- Usa el buscador integrado
- Haz clic en el icono para copiar su nombre

## Workflow de Uso

### 1. Identificar el Icono Necesario

**Pregunta al usuario** (si no está claro):
- "¿Qué representa el icono? (acción, estado, navegación)"
- "¿En qué contexto lo usarás? (botón, menú, indicador)"

**Busca por categoría en `references/icons-list.md`**:
- Acciones → Actions & Controls
- Navegación → Arrows & Navigation
- Archivos → File & Folder
- Estado → Status & Indicators
- Social → Social Media

### 2. Consultar Ejemplos de Uso

Lee `references/usage-patterns.md` para:
- Sintaxis correcta (HTML y TypeScript)
- Uso en componentes PrimeNG específicos
- Patrones comunes (botones de acción, headers, estados)
- Mejores prácticas

### 3. Implementar

**Opción A: String directo (HTML simple)**
```html
<i class="pi pi-check"></i>
```

**Opción B: En componente PrimeNG**
```html
<p-button icon="pi pi-save" label="Save" />
```

**Opción C: Con constantes TypeScript (recomendado)**
```typescript
import { PrimeIcons } from 'primeng/api';

menuItems = [
  { label: 'New', icon: PrimeIcons.PLUS },
  { label: 'Save', icon: PrimeIcons.SAVE }
];
```

## Patrones Frecuentes

### Pattern 1: Botones de Acción en Tabla
```typescript
// Lee usage-patterns.md sección "Botones de Acción en Tabla"
```
**Iconos**: pi-eye (ver), pi-pencil (editar), pi-trash (eliminar)

### Pattern 2: Estados y Notificaciones
```typescript
// Lee usage-patterns.md sección "Toast/Message con Iconos"
```
**Iconos**: pi-check-circle (success), pi-times-circle (error), pi-exclamation-triangle (warning)

### Pattern 3: Menú de Navegación
```typescript
// Lee usage-patterns.md sección "En Menús"
```
**Iconos**: pi-home, pi-user, pi-cog, pi-file, pi-chart-bar

### Pattern 4: Indicador de Carga
```typescript
// Lee usage-patterns.md sección "Estado de Carga"
```
**Iconos**: pi-spin pi-spinner (animado), pi-spin pi-cog

### Pattern 5: Búsqueda y Filtros
```typescript
// Lee usage-patterns.md sección "Búsqueda y Filtros"
```
**Iconos**: pi-search, pi-filter, pi-sort

## Características Especiales

### Animación de Rotación
```html
<!-- Usa la clase 'pi-spin' para animación infinita -->
<i class="pi pi-spin pi-spinner"></i>
<i class="pi pi-spin pi-cog"></i>
```
**Casos de uso**: Indicadores de carga, procesos en ejecución

### Tamaños Personalizados
```html
<i class="pi pi-check" style="font-size: 1rem"></i>    <!-- pequeño -->
<i class="pi pi-check" style="font-size: 1.5rem"></i>  <!-- mediano -->
<i class="pi pi-check" style="font-size: 2rem"></i>    <!-- grande -->
<i class="pi pi-check" style="font-size: 3rem"></i>    <!-- extra grande -->
```

### Colores Personalizados
```html
<!-- Color directo -->
<i class="pi pi-heart" style="color: red"></i>

<!-- Con CSS variables -->
<i class="pi pi-check" style="color: var(--primary-color)"></i>

<!-- Color heredado del padre -->
<span style="color: blue">
  <i class="pi pi-info"></i> Information
</span>
```

## Constantes TypeScript

### Ventajas de Usar Constantes
- ✅ Type-safety
- ✅ Autocomplete en IDE
- ✅ Refactoring seguro
- ✅ Previene typos

### Importación
```typescript
import { PrimeIcons } from 'primeng/api';
```

### Constantes Más Comunes
```typescript
// Acciones
PrimeIcons.PLUS         // pi pi-plus
PrimeIcons.MINUS        // pi pi-minus
PrimeIcons.TIMES        // pi pi-times
PrimeIcons.CHECK        // pi pi-check
PrimeIcons.SAVE         // pi pi-save
PrimeIcons.TRASH        // pi pi-trash
PrimeIcons.PENCIL       // pi pi-pencil

// Navegación
PrimeIcons.HOME         // pi pi-home
PrimeIcons.ARROW_LEFT   // pi pi-arrow-left
PrimeIcons.ARROW_RIGHT  // pi pi-arrow-right
PrimeIcons.CHEVRON_DOWN // pi pi-chevron-down

// Estado
PrimeIcons.SPINNER      // pi pi-spinner
PrimeIcons.CHECK_CIRCLE // pi pi-check-circle
PrimeIcons.TIMES_CIRCLE // pi pi-times-circle
PrimeIcons.EXCLAMATION_TRIANGLE // pi pi-exclamation-triangle

// UI
PrimeIcons.SEARCH       // pi pi-search
PrimeIcons.FILTER       // pi pi-filter
PrimeIcons.COG          // pi pi-cog
PrimeIcons.USER         // pi pi-user
PrimeIcons.BELL         // pi pi-bell
```

## Iconos por Caso de Uso

### CRUD Operations
```typescript
CREATE:  PrimeIcons.PLUS
READ:    PrimeIcons.EYE
UPDATE:  PrimeIcons.PENCIL
DELETE:  PrimeIcons.TRASH
COPY:    PrimeIcons.COPY
SAVE:    PrimeIcons.SAVE
```

### Notificaciones
```typescript
SUCCESS:  PrimeIcons.CHECK_CIRCLE      (verde)
ERROR:    PrimeIcons.TIMES_CIRCLE      (rojo)
WARNING:  PrimeIcons.EXCLAMATION_TRIANGLE  (amarillo)
INFO:     PrimeIcons.INFO_CIRCLE       (azul)
```

### Navegación de Aplicación
```typescript
HOME:      PrimeIcons.HOME
DASHBOARD: PrimeIcons.CHART_LINE
USERS:     PrimeIcons.USERS
SETTINGS:  PrimeIcons.COG
PROFILE:   PrimeIcons.USER
LOGOUT:    PrimeIcons.SIGN_OUT
```

### E-commerce
```typescript
CART:      PrimeIcons.SHOPPING_CART
WISHLIST:  PrimeIcons.HEART
PAYMENT:   PrimeIcons.CREDIT_CARD
SHIPPING:  PrimeIcons.TRUCK
ORDER:     PrimeIcons.RECEIPT
PRODUCT:   PrimeIcons.BOX
```

### Archivos y Datos
```typescript
DOWNLOAD:  PrimeIcons.DOWNLOAD
UPLOAD:    PrimeIcons.UPLOAD
FILE:      PrimeIcons.FILE
PDF:       PrimeIcons.FILE_PDF
EXCEL:     PrimeIcons.FILE_EXCEL
FOLDER:    PrimeIcons.FOLDER
```

## Guía de Referencias

**Cuando necesites**:
- ✅ **Buscar un icono** específico → Lee `references/icons-list.md` por categoría
- ✅ **Ver todos los iconos** disponibles → Lee `references/icons-list.md` completo
- ✅ **Ejemplos de código** → Lee `references/usage-patterns.md`
- ✅ **Uso en componentes** PrimeNG → Lee usage-patterns.md sección componentes
- ✅ **Mejores prácticas** → Lee usage-patterns.md sección best practices
- ✅ **Constantes TypeScript** → Lee icons-list.md o usage-patterns.md

## Troubleshooting

### Iconos no se muestran
```typescript
// ❌ Problema: CSS no importado
// ✅ Solución: Verificar angular.json o styles.scss
"styles": [
  "node_modules/primeicons/primeicons.css"
]
```

### Icono incorrecto
```typescript
// ❌ Problema: Nombre mal escrito
icon: "pi pi-chek"  // typo

// ✅ Solución: Usa constantes
icon: PrimeIcons.CHECK  // type-safe
```

### Icono muy pequeño
```html
<!-- ❌ Problema: tamaño por defecto -->
<i class="pi pi-check"></i>

<!-- ✅ Solución: especificar font-size -->
<i class="pi pi-check" style="font-size: 1.5rem"></i>
```

### No encuentra PrimeIcons en TypeScript
```typescript
// ❌ Problema: Import incorrecto
import { PrimeIcons } from 'primeicons';

// ✅ Solución: Import desde primeng/api
import { PrimeIcons } from 'primeng/api';
```

## Tips Importantes

1. **Usa constantes** en TypeScript para prevenir errores
2. **Mantén consistencia** en tamaños de iconos similares
3. **Considera accesibilidad**: agrega `aria-label` o tooltips
4. **Usa colores semánticos**: verde (success), rojo (danger), etc.
5. **pi-spin** solo para indicadores de carga
6. **No abuses** de iconos en interfaces - claridad sobre decoración

## Enlaces Útiles

- 📖 Documentación: https://primeng.org/icons
- 🎨 Figma Library: [PrimeIcons on Figma Community](https://www.figma.com/community/file/1354343849355792252/primeicons)
- 💡 GitHub: https://github.com/primefaces/primeicons
- 🐛 Request Icons: https://github.com/primefaces/primeicons/issues

## Workflow de Esta Skill

1. **Usuario pregunta** sobre iconos o necesita uno específico
2. **Identificar categoría** del icono buscado
3. **Buscar en icons-list.md** el icono apropiado
4. **Consultar usage-patterns.md** para ejemplo de implementación
5. **Proporcionar código** completo con mejores prácticas
6. **Sugerir uso de constantes** TypeScript cuando sea apropiado
