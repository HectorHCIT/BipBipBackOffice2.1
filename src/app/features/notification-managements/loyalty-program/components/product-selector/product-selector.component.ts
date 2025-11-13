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
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { LoyaltyService } from '../../services/loyalty.service';
import { Brand, Product, Modifier } from '../../models';

/**
 * Product Selector Component
 * Simple selector for ONE product with modifiers (no table)
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
    ToggleSwitchModule,
  ],
  templateUrl: './product-selector.component.html',
  styleUrls: ['./product-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSelectorComponent implements OnInit {
  @Input({ required: true }) productForm!: FormGroup;
  @Input() brands: Brand[] = [];

  private readonly loyaltyService = inject(LoyaltyService);
  private readonly fb = inject(FormBuilder);

  // Local state
  readonly products = signal<Product[]>([]);
  readonly modifiers = signal<Modifier[]>([]);
  readonly isLoadingProducts = signal(false);
  readonly isLoadingModifiers = signal(false);
  readonly hasProductSelected = signal(false);

  // Computed
  readonly selectedBrandId = computed(() => this.productForm.get('brand')?.value || 0);

  ngOnInit(): void {
    // Watch for brand changes
    this.productForm.get('brand')?.valueChanges.subscribe((brandId) => {
      if (brandId && brandId > 0) {
        this.loadProducts(brandId);
      } else {
        this.products.set([]);
      }
      // Reset product selection state when brand changes
      this.hasProductSelected.set(false);
      this.modifiers.set([]);
      this.modifiersArray.clear();
      // Disable and clear product select
      this.productForm.get('productCode')?.disable();
      this.productForm.patchValue({ productCode: '' });
    });

    // Watch for product changes
    this.productForm.get('productCode')?.valueChanges.subscribe((productId) => {
      if (productId) {
        this.hasProductSelected.set(true);
        this.loadModifiers(productId);
      } else {
        this.hasProductSelected.set(false);
        this.modifiers.set([]);
        this.modifiersArray.clear();
      }
    });
  }

  /**
   * Handle product selection change (from p-select onChange event)
   */
  onProductChange(productId: string): void {
    if (productId) {
      this.hasProductSelected.set(true);
      this.loadModifiers(productId);
    } else {
      this.hasProductSelected.set(false);
      this.modifiers.set([]);
      this.modifiersArray.clear();
    }
  }

  /**
   * Get modifiers array from product form
   */
  get modifiersArray(): FormArray {
    return this.productForm.get('modifiersProducts') as FormArray;
  }

  /**
   * Load products for selected brand
   */
  private loadProducts(brandId: number): void {
    this.isLoadingProducts.set(true);
    this.products.set([]);

    this.loyaltyService.getProducts(brandId).subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoadingProducts.set(false);
        // Enable product select after loading
        this.productForm.get('productCode')?.enable();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.products.set([]);
        this.isLoadingProducts.set(false);
      },
    });
  }

  /**
   * Load modifiers for selected product
   * Uses endpoint: Incentives/modifiers?productId={productId}&brand={shortNameBrand}
   */
  private loadModifiers(productId: string): void {
    const brandId = this.productForm.get('brand')?.value;
    const brand = this.brands.find((b) => b.idBrand === brandId);

    if (!brand) {
      console.error('Brand not found for ID:', brandId);
      return;
    }

    this.isLoadingModifiers.set(true);
    this.modifiersArray.clear();

    this.loyaltyService.getModifiers(productId, brand.shortNameBrand).subscribe({
      next: (response) => {
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
   * Add modifier to form
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
   * Remove modifier from form
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
}
