# PrimeNG Components Reference

Complete reference of PrimeNG components for Angular migration. Always use these components - never create custom alternatives.

## Form Components

| Component | Usage | Import | Example |
|-----------|-------|--------|---------|
| `<p-inputtext>` | Text input | `InputTextModule` | `<input pInputText formControlName="name" />` |
| `<p-inputnumber>` | Numeric input | `InputNumberModule` | `<p-inputnumber formControlName="price" />` |
| `<p-textarea>` | Multi-line text | `InputTextareaModule` | `<textarea pInputTextarea rows="3" />` |
| `<p-select>` | Dropdown | `SelectModule` | `<p-select [options]="items" optionLabel="name" />` |
| `<p-multiselect>` | Multi-select | `MultiSelectModule` | `<p-multiselect [options]="items" />` |
| `<p-checkbox>` | Checkbox | `CheckboxModule` | `<p-checkbox [binary]="true" />` |
| `<p-radiobutton>` | Radio | `RadioButtonModule` | `<p-radiobutton value="option1" />` |
| `<p-toggleswitch>` | Toggle | `ToggleSwitchModule` | `<p-toggleswitch formControlName="active" />` |
| `<p-datepicker>` | Date picker | `DatePickerModule` | `<p-datepicker dateFormat="dd/mm/yy" />` |
| `<p-password>` | Password | `PasswordModule` | `<p-password [feedback]="false" />` |
| `<p-inputmask>` | Masked input | `InputMaskModule` | `<p-inputmask mask="999-999-9999" />` |
| `<p-floatlabel>` | Float label | `FloatLabelModule` | `<p-floatlabel><input pInputText /></p-floatlabel>` |
| `<p-iconfield>` | Icon field | `IconFieldModule` | `<p-iconfield><p-inputicon /></p-iconfield>` |

## Layout Components

| Component | Usage | Import | Example |
|-----------|-------|--------|---------|
| `<p-drawer>` | Side panel | `DrawerModule` | `<p-drawer [visible]="true" position="right" />` |
| `<p-dialog>` | Modal | `DialogModule` | `<p-dialog [visible]="true" header="Title" />` |
| `<p-card>` | Card | `CardModule` | `<p-card header="Title" />` |
| `<p-panel>` | Panel | `PanelModule` | `<p-panel header="Title" [toggleable]="true" />` |
| `<p-fieldset>` | Fieldset | `FieldsetModule` | `<p-fieldset legend="Title" />` |
| `<p-divider>` | Divider | `DividerModule` | `<p-divider />` |
| `<p-tabs>` | Tabs | `TabsModule` | `<p-tabs>/<p-tablist /></p-tabs>` |
| `<p-accordion>` | Accordion | `AccordionModule` | `<p-accordion />` |

## Data Components

| Component | Usage | Import | Example |
|-----------|-------|--------|---------|
| `<p-table>` | Data table | `TableModule` | `<p-table [value]="items" [paginator]="true" />` |
| `<p-tag>` | Tag/Badge | `TagModule` | `<p-tag value="Active" severity="success" />` |
| `<p-badge>` | Badge | `BadgeModule` | `<p-badge value="3" />` |

## Action Components

| Component | Usage | Import | Example |
|-----------|-------|--------|---------|
| `<p-button>` | Button | `ButtonModule` | `<p-button label="Save" icon="pi pi-check" />` |
| `<p-splitbutton>` | Split button | `SplitButtonModule` | `<p-splitbutton label="Actions" [model]="items" />` |
| `<p-speeddial>` | FAB | `SpeedDialModule` | `<p-speeddial [model]="items" />` |

## Feedback Components

| Component | Usage | Import | Example |
|-----------|-------|--------|---------|
| `<p-toast>` | Toast | `ToastModule` | `<p-toast />` (with MessageService) |
| `<p-message>` | Inline message | `MessageModule` | `<p-message severity="info" text="Info" />` |
| `<p-progressspinner>` | Spinner | `ProgressSpinnerModule` | `<i class="pi pi-spin pi-spinner" />` |
| `<p-progressbar>` | Progress | `ProgressBarModule` | `<p-progressbar [value]="50" />` |

## Common Usage Examples

### Select with Options

```typescript
// Component
statusOptions = [
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' }
];

// Template
<p-select
  formControlName="status"
  [options]="statusOptions"
  optionLabel="label"
  optionValue="value"
  placeholder="Seleccione"
/>
```

### Drawer for Forms

```html
<p-drawer
  [visible]="true"
  [position]="'right'"
  [style]="{ width: '450px' }"
  [modal]="true"
  (onHide)="close()"
>
  <ng-template #header>
    <span>Form Title</span>
  </ng-template>

  <!-- Form content -->

  <ng-template #footer>
    <p-button label="Save" (onClick)="save()" />
  </ng-template>
</p-drawer>
```

### Table with Pagination

```html
<p-table
  [value]="companies()"
  [loading]="isLoading()"
  [paginator]="true"
  [rows]="10"
  [totalRecords]="totalRecords()"
  [lazy]="true"
  (onLazyLoad)="onPageChange($event)"
>
  <ng-template #header>
    <tr>
      <th>Name</th>
      <th>Status</th>
    </tr>
  </ng-template>
  <ng-template #body let-company>
    <tr>
      <td>{{ company.name }}</td>
      <td>
        <p-tag
          [value]="company.status"
          [severity]="company.status === 'active' ? 'success' : 'danger'"
        />
      </td>
    </tr>
  </ng-template>
</p-table>
```

---

**Remember**: Always use PrimeNG components. Never create custom UI alternatives!
