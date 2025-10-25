# PrimeNG Patterns & Best Practices

## Patrones de Importación

### Importación de Módulos
```typescript
// En el módulo o componente standalone
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
```

### Componente Standalone
```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    DialogModule
  ],
  template: `...`
})
export class ExampleComponent { }
```

### Módulo Tradicional
```typescript
@NgModule({
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    DialogModule
  ],
  declarations: [ExampleComponent]
})
export class ExampleModule { }
```

## Patrones de Uso Comunes

### 1. Formularios Reactivos con PrimeNG

```typescript
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, DropdownModule, ButtonModule],
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
      <div class="field">
        <label for="name">Name</label>
        <input pInputText id="name" formControlName="name" />
        <small class="p-error" *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched">
          Name is required
        </small>
      </div>
      
      <div class="field">
        <label for="country">Country</label>
        <p-dropdown 
          [options]="countries" 
          formControlName="country"
          optionLabel="name"
          placeholder="Select a Country"
        />
      </div>
      
      <p-button label="Submit" type="submit" [disabled]="userForm.invalid" />
    </form>
  `
})
export class UserFormComponent {
  userForm: FormGroup;
  countries = [
    { name: 'USA', code: 'US' },
    { name: 'Spain', code: 'ES' }
  ];

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      country: [null, Validators.required]
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      console.log(this.userForm.value);
    }
  }
}
```

### 2. Table con CRUD Operations

```typescript
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, InputTextModule],
  template: `
    <p-table [value]="products" [paginator]="true" [rows]="10" [globalFilterFields]="['name','category']">
      <ng-template pTemplate="caption">
        <div class="flex justify-content-between">
          <p-button label="New" icon="pi pi-plus" (onClick)="openNew()" />
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input pInputText type="text" (input)="onGlobalFilter($event)" placeholder="Search..." />
          </span>
        </div>
      </ng-template>
      
      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="name">Name <p-sortIcon field="name" /></th>
          <th pSortableColumn="price">Price <p-sortIcon field="price" /></th>
          <th pSortableColumn="category">Category <p-sortIcon field="category" /></th>
          <th>Actions</th>
        </tr>
      </ng-template>
      
      <ng-template pTemplate="body" let-product>
        <tr>
          <td>{{product.name}}</td>
          <td>{{product.price | currency}}</td>
          <td>{{product.category}}</td>
          <td>
            <p-button icon="pi pi-pencil" (onClick)="editProduct(product)" [rounded]="true" [text]="true" />
            <p-button icon="pi pi-trash" (onClick)="deleteProduct(product)" [rounded]="true" [text]="true" severity="danger" />
          </td>
        </tr>
      </ng-template>
    </p-table>

    <p-dialog [(visible)]="productDialog" [header]="'Product Details'" [modal]="true">
      <ng-template pTemplate="content">
        <div class="field">
          <label for="name">Name</label>
          <input pInputText id="name" [(ngModel)]="selectedProduct.name" required />
        </div>
        <!-- More fields... -->
      </ng-template>
      <ng-template pTemplate="footer">
        <p-button label="Cancel" (onClick)="hideDialog()" [text]="true" />
        <p-button label="Save" (onClick)="saveProduct()" />
      </ng-template>
    </p-dialog>
  `
})
export class ProductTableComponent {
  products: Product[] = [];
  selectedProduct: Product = {} as Product;
  productDialog = false;

  openNew() {
    this.selectedProduct = {} as Product;
    this.productDialog = true;
  }

  editProduct(product: Product) {
    this.selectedProduct = { ...product };
    this.productDialog = true;
  }

  deleteProduct(product: Product) {
    // Implement delete logic
  }

  saveProduct() {
    // Implement save logic
    this.productDialog = false;
  }

  hideDialog() {
    this.productDialog = false;
  }

  onGlobalFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    // Implement filter logic
  }
}
```

### 3. Toast Notifications Pattern

```typescript
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <!-- Rest of app -->
  `
})
export class AppComponent {
  constructor(private messageService: MessageService) {}

  showSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Operation completed successfully'
    });
  }

  showError() {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Something went wrong',
      life: 5000
    });
  }

  showMultiple() {
    this.messageService.addAll([
      { severity: 'success', summary: 'Message 1', detail: 'Success' },
      { severity: 'info', summary: 'Message 2', detail: 'Info' }
    ]);
  }
}
```

### 4. Confirm Dialog Pattern

```typescript
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-delete-example',
  standalone: true,
  imports: [ConfirmDialogModule, ButtonModule],
  providers: [ConfirmationService],
  template: `
    <p-confirmDialog />
    <p-button (onClick)="confirm()" label="Delete" />
  `
})
export class DeleteExampleComponent {
  constructor(private confirmationService: ConfirmationService) {}

  confirm() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        // Delete logic
        console.log('Deleted');
      },
      reject: () => {
        console.log('Cancelled');
      }
    });
  }
}
```

### 5. Dynamic Dialog Pattern

```typescript
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

// Dialog Component
@Component({
  selector: 'app-product-detail',
  template: `
    <div class="p-4">
      <h3>{{product.name}}</h3>
      <p>{{product.description}}</p>
      <p-button label="Close" (onClick)="close()" />
    </div>
  `
})
export class ProductDetailComponent {
  product: any;

  constructor(public ref: DynamicDialogRef) {}

  close() {
    this.ref.close();
  }
}

// Parent Component
@Component({
  selector: 'app-products',
  providers: [DialogService]
})
export class ProductsComponent {
  ref: DynamicDialogRef | undefined;

  constructor(private dialogService: DialogService) {}

  showProductDetail(product: any) {
    this.ref = this.dialogService.open(ProductDetailComponent, {
      header: 'Product Details',
      width: '50vw',
      data: { product }
    });

    this.ref.onClose.subscribe((result: any) => {
      if (result) {
        // Handle result
      }
    });
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
```

### 6. File Upload with Preview

```typescript
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [FileUploadModule],
  template: `
    <p-fileUpload 
      name="files[]"
      url="./upload"
      (onUpload)="onUpload($event)"
      (onSelect)="onSelect($event)"
      [multiple]="true"
      accept="image/*"
      [maxFileSize]="1000000"
      [showUploadButton]="false"
      [showCancelButton]="false"
    >
      <ng-template pTemplate="content">
        <ul *ngIf="uploadedFiles.length">
          <li *ngFor="let file of uploadedFiles">
            {{file.name}} - {{file.size}} bytes
          </li>
        </ul>
      </ng-template>
    </p-fileUpload>
  `
})
export class UploadComponent {
  uploadedFiles: any[] = [];

  onUpload(event: any) {
    for(let file of event.files) {
      this.uploadedFiles.push(file);
    }
  }

  onSelect(event: any) {
    // Preview logic
  }
}
```

### 7. Multi-Step Form (Stepper)

```typescript
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [StepperModule, ButtonModule, InputTextModule],
  template: `
    <p-stepper>
      <p-stepperPanel header="Personal Info">
        <ng-template pTemplate="content" let-nextCallback="nextCallback">
          <div class="field">
            <label for="name">Name</label>
            <input pInputText id="name" [(ngModel)]="formData.name" />
          </div>
          <div class="flex pt-4 justify-content-end">
            <p-button label="Next" (onClick)="nextCallback.emit()" />
          </div>
        </ng-template>
      </p-stepperPanel>

      <p-stepperPanel header="Contact">
        <ng-template pTemplate="content" let-prevCallback="prevCallback" let-nextCallback="nextCallback">
          <div class="field">
            <label for="email">Email</label>
            <input pInputText id="email" [(ngModel)]="formData.email" />
          </div>
          <div class="flex pt-4 justify-content-between">
            <p-button label="Back" (onClick)="prevCallback.emit()" [outlined]="true" />
            <p-button label="Next" (onClick)="nextCallback.emit()" />
          </div>
        </ng-template>
      </p-stepperPanel>

      <p-stepperPanel header="Confirmation">
        <ng-template pTemplate="content" let-prevCallback="prevCallback">
          <div class="p-4">
            <h4>Review your information</h4>
            <p>Name: {{formData.name}}</p>
            <p>Email: {{formData.email}}</p>
          </div>
          <div class="flex pt-4 justify-content-between">
            <p-button label="Back" (onClick)="prevCallback.emit()" [outlined]="true" />
            <p-button label="Submit" (onClick)="submit()" />
          </div>
        </ng-template>
      </p-stepperPanel>
    </p-stepper>
  `
})
export class WizardComponent {
  formData = {
    name: '',
    email: ''
  };

  submit() {
    console.log('Submitted:', this.formData);
  }
}
```

## Mejores Prácticas

### 1. Lazy Loading de Módulos
```typescript
// Importa solo lo que necesites para mejor tree-shaking
import { ButtonModule } from 'primeng/button';
// ❌ Evita: import { Button } from 'primeng/button';
```

### 2. Theming
```typescript
// En angular.json
"styles": [
  "node_modules/primeng/resources/themes/lara-light-blue/theme.css",
  "node_modules/primeng/resources/primeng.min.css",
  "node_modules/primeicons/primeicons.css"
]

// O en styles.scss
@import "primeng/resources/themes/lara-light-blue/theme.css";
@import "primeng/resources/primeng.min.css";
@import "primeicons/primeicons.css";
```

### 3. PrimeNG Flex
```html
<!-- Usa las utility classes de PrimeNG -->
<div class="flex justify-content-between align-items-center gap-2">
  <p-button label="Action 1" />
  <p-button label="Action 2" />
</div>
```

### 4. Responsive Design
```html
<p-table [value]="products" responsiveLayout="scroll">
  <!-- La tabla será scrollable en móviles -->
</p-table>
```

### 5. Accesibilidad
```html
<!-- Siempre incluye labels y aria attributes -->
<label for="username">Username</label>
<input pInputText id="username" aria-describedby="username-help" />
<small id="username-help">Enter your username</small>
```

### 6. Performance
```typescript
// Usa Virtual Scrolling para listas grandes
<p-table [value]="products" [scrollable]="true" scrollHeight="400px" [virtualScroll]="true" [virtualScrollItemSize]="50">
</p-table>

// Usa lazy loading para tablas grandes
<p-table [value]="products" [lazy]="true" (onLazyLoad)="loadData($event)">
</p-table>
```

### 7. Gestión de Estado Global
```typescript
// Usa servicios para compartir el MessageService
@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private messageService: MessageService) {}

  success(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message
    });
  }

  error(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
  }
}
```

## Casos de Uso por Tipo de Aplicación

### E-commerce
- **Table**: Listado de productos
- **DataView**: Vista de catálogo
- **FileUpload**: Subida de imágenes de productos
- **Rating**: Calificación de productos
- **Carousel**: Banner de ofertas
- **Cart**: Badge para contador del carrito

### Dashboard/Analytics
- **Chart**: Visualización de datos
- **Card**: Widgets de métricas
- **Table**: Reportes detallados
- **ProgressBar**: KPIs visuales
- **Timeline**: Actividad reciente

### CRM
- **Table**: Gestión de clientes/leads
- **Timeline**: Historia de interacciones
- **OrganizationChart**: Estructura de cuentas
- **Stepper**: Proceso de ventas
- **Knob**: Métricas visuales

### Backoffice/Admin
- **Tree**: Navegación de recursos
- **Menu/Menubar**: Navegación principal
- **Dialog**: Formularios modales
- **ConfirmDialog**: Operaciones críticas
- **Toast**: Feedback de operaciones
