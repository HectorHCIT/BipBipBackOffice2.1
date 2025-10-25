# Action Popovers Pattern

Patrón estándar para menús de acciones en filas de tablas usando `p-popover` con `p-button`.

## ¿Cuándo Usar Este Patrón?

- ✅ Menús de acciones por fila en tablas (Editar, Activar/Desactivar, Eliminar)
- ✅ Acciones contextuales en cards o items
- ✅ Cuando necesitas 2+ acciones en un elemento

## Patrón Estándar (Recomendado)

### HTML Template

```html
<!-- En la columna de acciones de la tabla -->
<td class="text-center">
  <!-- Botón trigger -->
  <p-button
    icon="pi pi-ellipsis-v"
    [rounded]="true"
    [text]="true"
    severity="secondary"
    (click)="actionsPopover.toggle($event)"
    pTooltip="Acciones"
    tooltipPosition="top"
    size="small">
  </p-button>

  <!-- Popover con acciones -->
  <p-popover #actionsPopover>
    <div class="flex flex-col gap-2 min-w-40">
      <!-- Acción: Editar -->
      <p-button
        label="Editar"
        icon="pi pi-pencil"
        [text]="true"
        severity="primary"
        (click)="openEditForm(item); actionsPopover.hide()"
        class="justify-start">
      </p-button>

      <!-- Acción: Activar/Desactivar (dinámico) -->
      <p-button
        [label]="item.status ? 'Desactivar' : 'Activar'"
        [icon]="item.status ? 'pi pi-times-circle' : 'pi pi-check-circle'"
        [text]="true"
        [severity]="item.status ? 'danger' : 'success'"
        (click)="toggleStatus(item); actionsPopover.hide()"
        class="justify-start">
      </p-button>

      <!-- Acción: Eliminar -->
      <p-button
        label="Eliminar"
        icon="pi pi-trash"
        [text]="true"
        severity="danger"
        (click)="deleteItem(item); actionsPopover.hide()"
        class="justify-start">
      </p-button>
    </div>
  </p-popover>
</td>
```

### TypeScript Component

```typescript
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-items-list',
  imports: [
    CommonModule,
    TableModule,
    PopoverModule,
    ButtonModule,
    TooltipModule,
    // ... otros módulos
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemsListComponent {

  openEditForm(item: Item): void {
    this.editingItem.set(item);
    this.showFormDrawer.set(true);
  }

  toggleStatus(item: Item): void {
    this.confirmationService.confirm({
      message: `¿Desea ${item.status ? 'desactivar' : 'activar'} "${item.name}"?`,
      header: 'Confirmar cambio de estado',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.itemService.toggleStatus(item.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Estado actualizado correctamente'
              });
              this.loadItems();
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo actualizar el estado'
              });
            }
          });
      }
    });
  }

  deleteItem(item: Item): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar "${item.name}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.itemService.delete(item.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Elemento eliminado correctamente'
              });
              this.loadItems();
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar el elemento'
              });
            }
          });
      }
    });
  }
}
```

## Características Clave

### 1. Botón Trigger
- **Icono**: `pi-ellipsis-v` (tres puntos verticales)
- **Estilo**: `[rounded]="true"` + `[text]="true"`
- **Severity**: `secondary` (neutral)
- **Tooltip**: Siempre agregar "Acciones"
- **Size**: `small` para tablas densas

### 2. Contenedor del Popover
- **Classes**: `flex flex-col gap-2 min-w-40`
- **Gap**: `gap-2` para separación consistente
- **Min-width**: `min-w-40` (160px) para labels legibles

### 3. Botones de Acción
- **Type**: `[text]="true"` (sin background por defecto)
- **Alignment**: `class="justify-start"` (alineación izquierda)
- **Icons**: Siempre incluir icono descriptivo
- **Severities**:
  - `primary` - Acciones principales (Editar, Ver)
  - `success` - Acciones positivas (Activar, Aprobar)
  - `danger` - Acciones destructivas (Desactivar, Eliminar)
  - `warn` - Acciones de precaución
- **Close**: Siempre llamar `actionsPopover.hide()` después del click

### 4. Iconos Recomendados por Acción

| Acción | Icono | Severity |
|--------|-------|----------|
| **Editar** | `pi-pencil` | `primary` |
| **Ver/Detalles** | `pi-eye` | `primary` |
| **Activar** | `pi-check-circle` | `success` |
| **Desactivar** | `pi-times-circle` | `danger` |
| **Eliminar** | `pi-trash` | `danger` |
| **Copiar** | `pi-copy` | `primary` |
| **Descargar** | `pi-download` | `primary` |
| **Compartir** | `pi-share-alt` | `primary` |

## Variaciones del Patrón

### Con Separadores (Para Agrupar Acciones)

```html
<p-popover #actionsPopover>
  <div class="flex flex-col gap-2 min-w-40">
    <!-- Grupo 1: Acciones principales -->
    <p-button
      label="Editar"
      icon="pi pi-pencil"
      [text]="true"
      severity="primary"
      (click)="edit(item); actionsPopover.hide()"
      class="justify-start">
    </p-button>

    <p-button
      label="Ver detalles"
      icon="pi pi-eye"
      [text]="true"
      severity="primary"
      (click)="viewDetails(item); actionsPopover.hide()"
      class="justify-start">
    </p-button>

    <!-- Separador visual -->
    <div class="border-t border-gray-200 my-1"></div>

    <!-- Grupo 2: Acciones destructivas -->
    <p-button
      label="Desactivar"
      icon="pi pi-times-circle"
      [text]="true"
      severity="danger"
      (click)="deactivate(item); actionsPopover.hide()"
      class="justify-start">
    </p-button>
  </div>
</p-popover>
```

### Con Acciones Condicionales

```html
<p-popover #actionsPopover>
  <div class="flex flex-col gap-2 min-w-40">
    <p-button
      label="Editar"
      icon="pi pi-pencil"
      [text]="true"
      severity="primary"
      (click)="edit(item); actionsPopover.hide()"
      class="justify-start">
    </p-button>

    <!-- Solo mostrar si el usuario tiene permisos -->
    @if (hasDeletePermission()) {
      <p-button
        label="Eliminar"
        icon="pi pi-trash"
        [text]="true"
        severity="danger"
        (click)="delete(item); actionsPopover.hide()"
        class="justify-start">
      </p-button>
    }

    <!-- Solo mostrar si el item está en estado draft -->
    @if (item.status === 'draft') {
      <p-button
        label="Publicar"
        icon="pi pi-send"
        [text]="true"
        severity="success"
        (click)="publish(item); actionsPopover.hide()"
        class="justify-start">
      </p-button>
    }
  </div>
</p-popover>
```

### Popover en Cards (No Tablas)

```html
<div class="card relative">
  <!-- Botón en esquina superior derecha -->
  <p-button
    icon="pi pi-ellipsis-v"
    [text]="true"
    severity="secondary"
    (click)="cardActions.toggle($event)"
    class="absolute top-2 right-2"
    size="small">
  </p-button>

  <p-popover #cardActions>
    <div class="flex flex-col gap-2 min-w-40">
      <!-- Acciones del card -->
    </div>
  </p-popover>

  <!-- Contenido del card -->
</div>
```

## Mejores Prácticas

### ✅ Do's
- Siempre usar `p-button` dentro del popover
- Incluir iconos en todas las acciones
- Usar severities semánticas (danger para destructivas, success para positivas)
- Cerrar el popover con `.hide()` después de cada acción
- Agregar tooltip "Acciones" al botón trigger
- Usar `justify-start` para alineación consistente
- Incluir confirmación para acciones destructivas

### ❌ Don'ts
- No usar `<button>` HTML simple dentro del popover
- No omitir iconos en las acciones
- No usar mismo severity para todas las acciones
- No olvidar cerrar el popover después del click
- No usar popover para una sola acción (usa botón directo)
- No hacer el popover muy ancho (max 200px recomendado)
- No poner más de 5-6 acciones (considera sub-menús)

## Template Reference Variables

**Importante**: Cada popover necesita su propia template reference variable:

```html
<!-- ✅ CORRECTO - Variable única por fila -->
<ng-template pTemplate="body" let-item>
  <tr>
    <td>
      <p-button (click)="actionsPopover.toggle($event)"></p-button>
      <p-popover #actionsPopover>
        <!-- contenido -->
      </p-popover>
    </td>
  </tr>
</ng-template>

<!-- ❌ INCORRECTO - Compartir reference variable causa conflictos -->
<p-popover #sharedPopover></p-popover>
<ng-template pTemplate="body" let-item>
  <tr>
    <td>
      <p-button (click)="sharedPopover.toggle($event)"></p-button>
    </td>
  </tr>
</ng-template>
```

## Performance Tips

1. **OnPush Change Detection**: El patrón funciona perfectamente con OnPush
2. **Virtual Scroll**: Compatible con tablas grandes usando virtual scroll
3. **Lazy Loading**: Los popovers solo se renderizan cuando se hace click

## Integración con Servicios

```typescript
// Siempre usar ConfirmationService para acciones destructivas
constructor() {
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);
}

// Providers necesarios en el componente
providers: [ConfirmationService, MessageService]
```

## Ejemplos Completos

Ver implementaciones reales en:
- `src/app/features/biometrics/pages/biometric-list/biometric-list.component.html`
- `src/app/features/structures/pages/companies-list/companies-list.component.html`
- `src/app/features/structures/pages/areas-list/areas-list.component.html`

## Referencias

- [PrimeNG Popover Docs](https://primeng.org/popover)
- [PrimeNG Button Docs](https://primeng.org/button)
- Skill relacionada: `primeng-standards/TABLES.md`
