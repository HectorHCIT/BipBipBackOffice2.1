import {
  Component,
  Input,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProductSelectorComponent } from '../product-selector/product-selector.component';
import { LoyaltyFormService } from '../../services/loyalty-form.service';
import { Brand, BenefitType } from '../../models';

/**
 * Benefit Selector Component
 * Form to add benefits with conditional fields based on benefit type
 */
@Component({
  selector: 'app-benefit-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    InputNumberModule,
    ToggleSwitchModule,
    DividerModule,
    TableModule,
    TagModule,
    ProductSelectorComponent,
  ],
  templateUrl: './benefit-selector.component.html',
  styleUrls: ['./benefit-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenefitSelectorComponent implements OnInit {
  @Input({ required: true }) parentForm!: FormGroup;
  @Input() brands: Brand[] = [];

  private readonly formService = inject(LoyaltyFormService);
  private readonly fb = inject(FormBuilder);

  // Temporary form for adding benefits
  readonly addBenefitForm = signal<FormGroup>(this.createAddBenefitForm());

  // Benefit type options
  readonly benefitTypeOptions = [
    { label: 'Envío Gratis', value: 'EG' },
    { label: 'Aperitivo Gratis', value: 'AG' },
    { label: 'Postres Gratis', value: 'PG' },
    { label: 'Descuento Fijo', value: 'DF' },
    { label: 'Descuento Porcentual', value: 'DP' },
  ];

  ngOnInit(): void {
    // Watch for benefit type changes to show/hide conditional fields
    this.addBenefitForm().get('type')?.valueChanges.subscribe((type) => {
      this.updateConditionalFields(type);
    });
  }

  /**
   * Create form for adding benefits
   */
  private createAddBenefitForm(): FormGroup {
    return this.fb.nonNullable.group({
      type: ['', Validators.required],
      nameBenefit: ['', Validators.required],
      descriptionBenefit: ['', Validators.required],
      priceDiscount: [0],
      active: [true],
      // Temporary array to hold products before adding benefit
      tempProducts: this.fb.array([]),
      // Product form for adding individual products (for AG/PG)
      productData: this.fb.group({
        brand: [0],
        productCode: [{ value: '', disabled: true }],
        quantity: [1],
        active: [true],
        modifiersProducts: this.fb.array([]),
      }),
    });
  }

  /**
   * Update conditional field validators based on benefit type
   */
  private updateConditionalFields(type: string): void {
    const priceDiscount = this.addBenefitForm().get('priceDiscount');
    const productData = this.addBenefitForm().get('productData');

    // Reset validators
    priceDiscount?.clearValidators();
    productData?.clearValidators();

    // DF or DP require discount
    if (type === 'DF' || type === 'DP') {
      priceDiscount?.setValidators([Validators.required, Validators.min(0.01)]);
    }

    // AG or PG require product
    if (type === 'AG' || type === 'PG') {
      // Product validation will be handled by the ProductSelector component
    }

    priceDiscount?.updateValueAndValidity();
    productData?.updateValueAndValidity();
  }

  /**
   * Check if benefit type requires discount
   */
  shouldShowDiscount(): boolean {
    const type = this.addBenefitForm().get('type')?.value;
    return type === 'DF' || type === 'DP';
  }

  /**
   * Check if benefit type requires product selection
   */
  shouldShowProduct(): boolean {
    const type = this.addBenefitForm().get('type')?.value;
    return type === 'AG' || type === 'PG';
  }

  /**
   * Get product form group for ProductSelector
   */
  get productForm(): FormGroup {
    return this.addBenefitForm().get('productData') as FormGroup;
  }

  /**
   * Get benefits array from parent form
   */
  get benefitsArray(): FormArray {
    return this.formService.getBenefitsArray(this.parentForm);
  }

  /**
   * Get temporary products array
   */
  get tempProductsArray(): FormArray {
    return this.addBenefitForm().get('tempProducts') as FormArray;
  }

  /**
   * Add product to temporary products list
   */
  onAddProduct(): void {
    const productData = this.addBenefitForm().get('productData');

    if (!productData?.get('productCode')?.value) {
      return;
    }

    const formValue = productData.getRawValue();

    // Create product group
    const productGroup = this.fb.nonNullable.group({
      brand: [formValue.brand],
      productCode: [formValue.productCode],
      quantity: [formValue.quantity],
      active: [formValue.active],
      levelcatLimit: [0],
      modifiersProducts: this.fb.array(
        formValue.modifiersProducts.map((mod: any) =>
          this.fb.nonNullable.group({
            codLoyaltyItemModifier: [mod.codLoyaltyItemModifier || null],
            codItemProduct: [mod.codItemProduct || null],
            modifierId: [mod.modifierId],
            modifierCode: [mod.modifierCode],
            quantity: [mod.quantity],
            modifierActive: [mod.modifierActive],
          })
        )
      ),
    });

    // Add to temp array
    this.tempProductsArray.push(productGroup);

    // Reset product form
    productData.reset({
      brand: 0,
      productCode: { value: '', disabled: true },
      quantity: 1,
      active: true,
      modifiersProducts: [],
    });

    // Clear modifiers array
    const modifiersArray = productData.get('modifiersProducts') as FormArray;
    modifiersArray.clear();
  }

  /**
   * Remove product from temporary list
   */
  onRemoveProduct(index: number): void {
    this.tempProductsArray.removeAt(index);
  }

  /**
   * Get table data for temporary products
   */
  getTempProductsTableData(): any[] {
    return this.tempProductsArray.controls.map((control, index) => {
      const product = control.value;
      const brand = this.brands.find(b => b.idBrand === product.brand);
      const modifiersArray = control.get('modifiersProducts') as FormArray;

      return {
        index,
        brandName: brand?.nameBrand || 'N/A',
        productCode: product.productCode,
        quantity: product.quantity,
        active: product.active,
        modifiersCount: modifiersArray?.length || 0
      };
    });
  }

  /**
   * Add benefit to parent form
   */
  onAddBenefit(): void {
    if (this.addBenefitForm().invalid) {
      this.addBenefitForm().markAllAsTouched();
      return;
    }

    const formValue = this.addBenefitForm().getRawValue();
    const type = formValue.type;

    // Validate that AG/PG benefits have at least one product
    if ((type === 'AG' || type === 'PG') && this.tempProductsArray.length === 0) {
      alert('Debes agregar al menos un producto para este tipo de beneficio');
      return;
    }

    // Create benefit group
    const benefitGroup = this.fb.nonNullable.group({
      type: [type],
      nameBenefit: [formValue.nameBenefit],
      descriptionBenefit: [formValue.descriptionBenefit],
      priceDiscount: [(type === 'DF' || type === 'DP') ? formValue.priceDiscount : 0],
      active: [formValue.active],
      benefitIcon: [''],
      itemCode: [0],
      isProduct: [(type === 'AG' || type === 'PG')],
      productsBenefits: this.fb.array([]),
    });

    // If AG/PG, add all products from tempProducts
    if (type === 'AG' || type === 'PG') {
      const productArray = benefitGroup.get('productsBenefits') as FormArray;

      // Copy all products from temp array to benefit
      this.tempProductsArray.controls.forEach(productControl => {
        const productValue = productControl.value;
        const productGroup = this.fb.nonNullable.group({
          codItemProduct: [0],
          brand: [productValue.brand],
          productCode: [productValue.productCode],
          quantity: [productValue.quantity],
          active: [productValue.active],
          levelcatLimit: [0],
          modifiersProducts: this.fb.array(
            productValue.modifiersProducts.map((mod: any) =>
              this.fb.nonNullable.group({
                codLoyaltyItemModifier: [mod.codLoyaltyItemModifier || null],
                codItemProduct: [mod.codItemProduct || null],
                modifierId: [mod.modifierId],
                modifierCode: [mod.modifierCode],
                quantity: [mod.quantity],
                modifierActive: [mod.modifierActive],
              })
            )
          ),
        });
        productArray.push(productGroup);
      });
    }

    // Add to parent form
    this.benefitsArray.push(benefitGroup);

    // Reset form
    this.addBenefitForm.set(this.createAddBenefitForm());
  }

  /**
   * Get benefit type label
   */
  getBenefitTypeLabel(code: string): string {
    const option = this.benefitTypeOptions.find((opt) => opt.value === code);
    return option?.label || code;
  }
}
