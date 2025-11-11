import {
  Component,
  Input,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { LoyaltyService } from '../../services/loyalty.service';
import { LoyaltyFormService } from '../../services/loyalty-form.service';
import { Brand, Product, Modifier } from '../../models';

/**
 * Product Selector Component
 * Displays a form to add products and a table showing added products
 */
@Component({
  selector: 'app-product-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    SelectModule,
    InputNumberModule,
    ToggleButtonModule,
    TableModule,
    TagModule,
  ],
  templateUrl: './product-selector.component.html',
  styleUrls: ['./product-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSelectorComponent implements OnInit {
  @Input({ required: true }) benefitIndex!: number;
  @Input({ required: true }) parentForm!: FormGroup;
  @Input() brands: Brand[] = [];

  private readonly loyaltyService = inject(LoyaltyService);
  private readonly formService = inject(LoyaltyFormService);
  private readonly fb = inject(FormBuilder);

  // Temporary form for adding products
  readonly addProductForm = signal<FormGroup>(this.createAddProductForm());

  // Local state
  readonly products = signal<Product[]>([]);
  readonly modifiers = signal<Modifier[]>([]);
  readonly isLoadingProducts = signal(false);
  readonly isLoadingModifiers = signal(false);

  // Computed
  readonly selectedBrandId = computed(() => this.addProductForm().get('brand')?.value || 0);
  readonly selectedProductId = computed(() => {
    const form = this.addProductForm();
    const productCode = form.get('productCode')?.value;
    return productCode || '';
  });

  ngOnInit(): void {
    // Watch for brand changes
    this.addProductForm().get('brand')?.valueChanges.subscribe((brandId) => {
      if (brandId && brandId > 0) {
        this.loadProducts(brandId);
      } else {
        this.products.set([]);
      }
    });

    // Watch for product changes - using emitEvent option
    this.addProductForm().get('productCode')?.valueChanges.subscribe((productId) => {
      console.log('Product valueChanges:', productId);
      if (productId) {
        this.loadModifiers(productId);
      } else {
        this.modifiers.set([]);
        this.modifiersArray.clear();
      }
    });
  }

  /**
   * Handle product selection change (from p-select onChange event)
   */
  onProductChange(productId: string): void {
    console.log('onProductChange event:', productId);
    if (productId) {
      this.loadModifiers(productId);
    } else {
      this.modifiers.set([]);
      this.modifiersArray.clear();
    }
  }

  /**
   * Create form for adding products
   */
  private createAddProductForm(): FormGroup {
    return this.fb.nonNullable.group({
      brand: [0, Validators.required],
      productCode: [{ value: '', disabled: true }, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      active: [true],
      modifiersProducts: this.fb.array([]),
    });
  }

  /**
   * Get products array from parent form
   */
  get productsArray(): FormArray {
    return this.formService.getProductsArray(this.parentForm, this.benefitIndex);
  }

  /**
   * Get modifiers array from add form
   */
  get modifiersArray(): FormArray {
    return this.addProductForm().get('modifiersProducts') as FormArray;
  }

  /**
   * Load products for selected brand
   */
  private loadProducts(brandId: number): void {
    this.isLoadingProducts.set(true);
    this.products.set([]);

    // Disable product select while loading
    this.addProductForm().get('productCode')?.disable();

    // Clear product selection
    this.addProductForm().patchValue({ productCode: '' });

    this.loyaltyService.getProducts(brandId).subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoadingProducts.set(false);

        // Enable product select after loading
        this.addProductForm().get('productCode')?.enable();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.products.set([]);
        this.isLoadingProducts.set(false);

        // Keep disabled on error
        this.addProductForm().get('productCode')?.disable();
      },
    });
  }

  /**
   * Load modifiers for selected product
   * Uses endpoint: Incentives/modifiers?productId={productId}&brand={shortNameBrand}
   */
  private loadModifiers(productId: string): void {
    // Get brandId directly from form to avoid timing issues with computed signal
    const brandId = this.addProductForm().get('brand')?.value;
    console.log('loadModifiers - brandId from form:', brandId);
    console.log('loadModifiers - selectedProductId():', this.selectedProductId());

    const brand = this.brands.find((b) => b.idBrand === brandId);

    if (!brand) {
      console.error('Brand not found for ID:', brandId, 'Available brands:', this.brands);
      return;
    }

    console.log('Loading modifiers for product:', productId, 'brand:', brand.shortNameBrand);
    this.isLoadingModifiers.set(true);
    this.modifiersArray.clear();

    // Call API with productId and shortNameBrand (e.g., "PH", "KFC")
    this.loyaltyService.getModifiers(productId, brand.shortNameBrand).subscribe({
      next: (response) => {
        console.log('Modifiers received:', response.modifiers);
        console.log('After setting modifiers - selectedProductId():', this.selectedProductId());
        console.log('After setting modifiers - modifiers().length:', response.modifiers?.length);
        this.modifiers.set(response.modifiers || []);
        this.isLoadingModifiers.set(false);
      },
      error: (error) => {
        console.error('Error loading modifiers:', error);
        this.modifiers.set([]);
        this.isLoadingModifiers.set(false);
      },
    });
  }

  /**
   * Add modifier to add form
   */
  onAddModifier(): void {
    const modifierGroup = this.fb.nonNullable.group({
      codLoyaltyItemModifier: [null as number | null],
      codItemProduct: [null as number | null],
      modifierId: ['', Validators.required],
      modifierCode: ['', Validators.required],
      modifierActive: [true],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
    this.modifiersArray.push(modifierGroup);
  }

  /**
   * Remove modifier from add form
   */
  onRemoveModifier(index: number): void {
    this.modifiersArray.removeAt(index);
  }

  /**
   * Handle modifier selection change
   */
  onModifierChange(modifierId: string, modifierIndex: number): void {
    const modifier = this.modifiers().find((m) => m.modifierId === modifierId);
    if (modifier && this.modifiersArray.at(modifierIndex)) {
      const modifierControl = this.modifiersArray.at(modifierIndex);
      modifierControl.patchValue({
        modifierCode: modifier.options[0]?.modifierOptionId || '',
      });
    }
  }

  /**
   * Add product to table (parent form)
   */
  onAddProduct(): void {
    if (this.addProductForm().invalid) {
      this.addProductForm().markAllAsTouched();
      return;
    }

    const formValue = this.addProductForm().getRawValue(); // Use getRawValue to include disabled fields

    // Get product name for display
    const selectedProduct = this.products().find((p) => p.productId === formValue.productCode);
    const productName = selectedProduct?.name || formValue.productCode;

    // Create product group with current form values
    const productGroup = this.fb.nonNullable.group({
      brand: [formValue.brand],
      productCode: [formValue.productCode],
      productName: [productName], // Store product name for display
      quantity: [formValue.quantity],
      active: [formValue.active],
      modifiersProducts: this.fb.array(
        formValue.modifiersProducts.map((mod: any) => {
          // Get modifier and option names for display
          const modifier = this.modifiers().find((m) => m.modifierId === mod.modifierId);
          const modifierName = modifier?.name || mod.modifierId;
          const option = modifier?.options.find((o) => o.modifierOptionId === mod.modifierCode);
          const optionName = option?.name || mod.modifierCode;

          return this.fb.nonNullable.group({
            codLoyaltyItemModifier: [mod.codLoyaltyItemModifier],
            codItemProduct: [mod.codItemProduct],
            modifierId: [mod.modifierId],
            modifierName: [modifierName], // Store name for display
            modifierCode: [mod.modifierCode],
            modifierOptionName: [optionName], // Store option name for display
            modifierActive: [mod.modifierActive],
            quantity: [mod.quantity],
          });
        })
      ),
    });

    this.productsArray.push(productGroup);

    // Reset form
    this.addProductForm.set(this.createAddProductForm());
    this.products.set([]);
    this.modifiers.set([]);
  }

  /**
   * Remove product from table
   */
  onRemoveProduct(index: number): void {
    this.productsArray.removeAt(index);
  }

  /**
   * Get product options for select
   */
  getProductOptions(): any[] {
    return this.products().map((product) => ({
      label: product.name,
      value: product.productId,
    }));
  }

  /**
   * Get brand options for select
   */
  getBrandOptions(): any[] {
    return this.brands.map((brand) => ({
      label: brand.nameBrand,
      value: brand.idBrand,
    }));
  }

  /**
   * Get modifier list for select
   */
  getModifierList(): any[] {
    return this.modifiers().map((modifier) => ({
      label: modifier.name,
      value: modifier.modifierId,
    }));
  }

  /**
   * Get modifier options for a specific modifier
   */
  getModifierOptions(modifierIndex: number): any[] {
    const modifierId = this.modifiersArray.at(modifierIndex)?.get('modifierId')?.value;
    if (!modifierId) return [];

    const modifier = this.modifiers().find((m) => m.modifierId === modifierId);
    return (
      modifier?.options.map((opt) => ({
        label: opt.name,
        value: opt.modifierOptionId,
      })) || []
    );
  }

  /**
   * Get brand name by ID
   */
  getBrandName(brandId: number): string {
    return this.brands.find((b) => b.idBrand === brandId)?.nameBrand || '';
  }

  /**
   * Get product name by ID
   */
  getProductName(brandId: number, productId: string): string {
    // We need to find the product - if it's in the current products list, use that
    // Otherwise, we'd need to store the name when adding the product
    const product = this.products().find((p) => p.productId === productId);
    return product?.name || productId;
  }

  /**
   * Get table data for display
   */
  getTableData(): any[] {
    return this.productsArray.controls.map((control, index) => {
      const value = control.value;
      const modifiersArray = control.get('modifiersProducts') as FormArray;

      return {
        index,
        brand: this.getBrandName(value.brand),
        brandId: value.brand,
        product: value.productName || value.productCode,
        productCode: value.productCode,
        quantity: value.quantity,
        active: value.active,
        modifiersCount: modifiersArray.length,
        modifiers: modifiersArray.controls.map((mod) => mod.value),
      };
    });
  }
}
