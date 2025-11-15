import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
  DestroyRef,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { forkJoin } from 'rxjs';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SelectModule } from 'primeng/select';
import { ColorPickerModule } from 'primeng/colorpicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CardModule } from 'primeng/card';
import { MenuItem, MessageService } from 'primeng/api';

// Services & Models
import { ProductsInPromotionsService } from '../../services';
import {
  ProductInPromotion,
  CreateProductInPromotion,
  ProductData,
  ProductTagPosition,
  POSITION_OPTIONS
} from '../../models';
import { ProductTagPositionUtils } from '../../utils';

// Core
import { GlobalDataService } from '@core/services/global-data.service';
import { Brand } from '@core/models/global-data.model';

@Component({
  selector: 'app-product-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    BreadcrumbModule,
    SelectModule,
    ColorPickerModule,
    FloatLabelModule,
    CardModule
  ],
  providers: [MessageService],
  templateUrl: './product-form-page.component.html',
  styleUrls: ['./product-form-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProductsInPromotionsService);
  private readonly globalData = inject(GlobalDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  // Exponer utility para el template
  readonly ProductTagPositionUtils = ProductTagPositionUtils;

  // Modo edición
  readonly isEditMode = signal(false);
  readonly productId = signal<string | null>(null);
  readonly brandId = signal<string | null>(null);

  // Estado
  readonly isLoading = signal(false);
  readonly isLoadingBrands = signal(false);
  readonly isSaving = signal(false);
  readonly productsList = signal<ProductData[]>([]);
  readonly selectedBrandId = signal<number | null>(null);

  // Brands desde global data
  readonly brandsList = this.globalData.brands;
  readonly isLoadingBrandsGlobal = this.globalData.isLoadingBrands;

  // Opciones de posición
  readonly positionOptions = POSITION_OPTIONS;

  // Formulario
  productForm!: FormGroup;

  // Breadcrumb
  readonly breadcrumbItems = computed<MenuItem[]>(() => [
    { label: 'Gest. Notificaciones' },
    { label: 'Productos en Promoción', routerLink: '/notification-managements/products-in-promotions' },
    { label: this.isEditMode() ? 'Editar Producto' : 'Nuevo Producto' }
  ]);
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Signals para valores del formulario (para reactividad)
  private readonly formText = signal<string>('');
  private readonly formBackgroundColor = signal<string>('#FF5733');
  private readonly formTextColor = signal<string>('#FFFFFF');
  private readonly formPosition = signal<string>(ProductTagPosition.topRight);
  private readonly formProductId = signal<string | null>(null);
  private readonly formOldPrice = signal<string | null>(null);

  // Computed: Preview del tag
  readonly tagPreview = computed(() => {
    const backgroundColor = this.formBackgroundColor();
    const textColor = this.formTextColor();
    const text = this.formText();
    const position = this.formPosition();

    return {
      backgroundColor,
      textColor,
      text,
      position,
      positionClasses: ProductTagPositionUtils.getPositionClasses(position)
    };
  });

  // Computed: Producto seleccionado
  readonly selectedProduct = computed(() => {
    const productId = this.formProductId();
    if (!productId) return null;

    const product = this.productsList().find(p => p.productId === productId);
    return product || null;
  });

  // Computed: Descuento calculado
  readonly discountPercentage = computed(() => {
    const product = this.selectedProduct();
    const oldPriceValue = this.formOldPrice();

    if (!product || !oldPriceValue) return null;

    const oldPrice = parseFloat(oldPriceValue);
    const currentPrice = parseFloat(product.price);

    if (oldPrice <= 0 || currentPrice <= 0 || oldPrice <= currentPrice) return null;

    const discount = ((oldPrice - currentPrice) / oldPrice) * 100;

    return discount > 0 ? Math.round(discount) : null;
  });

  constructor() {
    // Effect para cargar productos cuando cambia la marca
    effect(() => {
      const brandId = this.selectedBrandId();
      if (brandId) {
        this.loadProductsByBrand(brandId);
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadBrandsIfNeeded();
    this.checkEditMode();
  }

  /**
   * Carga las marcas si no están cargadas
   */
  private loadBrandsIfNeeded(): void {
    // Si ya hay marcas, no hacer nada
    if (this.brandsList().length > 0) {
      return;
    }

    // Si no hay marcas, cargarlas
    this.isLoadingBrands.set(true);
    this.globalData.forceRefresh('brands');

    // Esperar a que terminen de cargar
    const checkBrands = setInterval(() => {
      if (!this.isLoadingBrandsGlobal()) {
        clearInterval(checkBrands);
        this.isLoadingBrands.set(false);
      }
    }, 100);
  }

  /**
   * Inicializa el formulario reactivo
   */
  private initializeForm(): void {
    this.productForm = this.fb.group({
      brandId: [null, Validators.required],
      productId: [null, Validators.required],
      text: ['', [Validators.required, Validators.maxLength(20)]],
      backgroundColor: ['#FF5733', Validators.required],
      textColor: ['#FFFFFF', Validators.required],
      position: [ProductTagPosition.topRight, Validators.required],
      oldPrice: [null]
    });

    // Listener para cambio de marca
    this.productForm.get('brandId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(brandId => {
        if (brandId) {
          this.selectedBrandId.set(brandId);
          // Reset product selection when brand changes
          if (!this.isEditMode()) {
            this.productForm.patchValue({ productId: null });
          }
        }
      });

    // Listeners para actualizar signals (para vista previa reactiva)
    this.productForm.get('text')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.formText.set(value || ''));

    this.productForm.get('backgroundColor')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.formBackgroundColor.set(value || '#FF5733'));

    this.productForm.get('textColor')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.formTextColor.set(value || '#FFFFFF'));

    this.productForm.get('position')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.formPosition.set(value || ProductTagPosition.topRight));

    this.productForm.get('productId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.formProductId.set(value || null));

    this.productForm.get('oldPrice')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.formOldPrice.set(value || null));
  }

  /**
   * Verifica si estamos en modo edición
   */
  private checkEditMode(): void {
    const productIdParam = this.route.snapshot.paramMap.get('productId');
    const brandIdParam = this.route.snapshot.paramMap.get('brandId');

    if (productIdParam && brandIdParam) {
      this.isEditMode.set(true);
      this.productId.set(productIdParam);
      this.brandId.set(brandIdParam);
      this.loadProductForEdit(productIdParam, brandIdParam);
    }
  }

  /**
   * Carga los productos de una marca
   */
  private loadProductsByBrand(brandId: number): void {
    this.service.getProductsByBrand(brandId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          this.productsList.set(products);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar los productos'
          });
          this.productsList.set([]);
        }
      });
  }

  /**
   * Carga un producto para edición
   */
  private loadProductForEdit(productId: string, brandId: string): void {
    this.isLoading.set(true);

    this.service.getProductInPromotionById(productId, brandId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => {
          // Set brand first to trigger products loading
          this.selectedBrandId.set(Number(product.brandId));

          // Populate form
          this.productForm.patchValue({
            brandId: Number(product.brandId),
            productId: product.productId,
            text: product.text,
            backgroundColor: product.backgroundColor,
            textColor: product.textColor,
            position: product.position,
            oldPrice: product.oldPrice ? Number(product.oldPrice) : null
          });

          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el producto'
          });
          this.isLoading.set(false);
          this.goBack();
        }
      });
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario Incompleto',
        detail: 'Por favor complete todos los campos requeridos'
      });
      return;
    }

    const formValue = this.productForm.value;
    const productData: CreateProductInPromotion = {
      productId: formValue.productId.toString(),
      brandId: formValue.brandId.toString(),
      text: formValue.text.trim(),
      backgroundColor: formValue.backgroundColor,
      textColor: formValue.textColor,
      position: formValue.position,
      oldPrice: formValue.oldPrice ? formValue.oldPrice.toString() : undefined
    };

    this.isSaving.set(true);

    const operation = this.isEditMode()
      ? this.service.updateProductInPromotion(productData)
      : this.service.createProductInPromotion(productData);

    operation
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: this.isEditMode()
              ? 'Producto actualizado correctamente'
              : 'Producto creado correctamente'
          });

          // Refresh the list
          this.service.loadProducts();

          // Navigate back
          setTimeout(() => this.goBack(), 1000);
        },
        error: (error) => {
          console.error('Error saving product:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.isEditMode()
              ? 'Error al actualizar el producto'
              : 'Error al crear el producto'
          });
          this.isSaving.set(false);
        }
      });
  }

  /**
   * Navega de vuelta a la lista
   */
  goBack(): void {
    this.router.navigate(['/notification-managements/products-in-promotions']);
  }

  /**
   * Obtiene el label de una posición
   */
  getPositionLabel(position: string): string {
    return ProductTagPositionUtils.getPositionLabel(position);
  }

  /**
   * Formatea el precio para mostrar
   */
  formatPrice(price: number | string): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `L. ${numPrice.toFixed(2)}`;
  }
}
