import { Injectable, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BenefitType, LoyaltyLevel } from '../models';

/**
 * Loyalty Form Service
 * Helper service for managing complex nested forms in loyalty program
 */
@Injectable({
  providedIn: 'root'
})
export class LoyaltyFormService {
  private readonly fb = inject(FormBuilder);

  /**
   * Create main loyalty level form
   */
  createLoyaltyForm(): FormGroup {
    return this.fb.nonNullable.group({
      levelName: ['', [Validators.required, Validators.minLength(3)]],
      levelDesc: [''],
      requieredPts: [0, [Validators.required, Validators.min(1)]],
      maxPts: [0, [Validators.required, Validators.min(1)]],
      isActive: [false],
      isPublish: [false],
      benefitsList: this.fb.array([]),
      iconLevel: [''],
      hexavalue: ['#000000'],
      convertFactor: [null as number | null],
    });
  }

  /**
   * Create benefit form group
   */
  createBenefit(): FormGroup {
    return this.fb.nonNullable.group({
      type: ['' as string],
      nameBenefit: [''],
      descriptionBenefit: [''],
      levelcatLimit: [1],
      priceDiscount: [null as number | null],
      isProduct: [false],
      active: [true],
      productsBenefits: this.fb.array([]),
      productCode: [''],
      benefitIcon: [''],
      benefitIconFile: [null as File | null],
      itemCode: [null as number | null],
    });
  }

  /**
   * Create product form group
   */
  createProduct(): FormGroup {
    return this.fb.nonNullable.group({
      brand: [0],
      productCode: [''],
      levelcatLimit: [1],
      active: [true],
      modifiersProducts: this.fb.array([]),
      quantity: [null as number | null],
    });
  }

  /**
   * Create modifier form group
   */
  createModifier(): FormGroup {
    return this.fb.nonNullable.group({
      codLoyaltyItemModifier: [null as number | null],
      codItemProduct: [null as number | null],
      modifierId: [''],
      modifierCode: [''],
      modifierActive: [true],
      quantity: [null as number | null],
    });
  }

  /**
   * Map loyalty level data to form
   */
  mapLevelToForm(level: LoyaltyLevel, form: FormGroup): void {
    form.patchValue({
      levelName: level.loyaltyLevelName,
      levelDesc: level.messageLevel,
      requieredPts: level.minPointsLevel,
      maxPts: level.maxPointsLevel,
      isActive: level.isActive,
      isPublish: level.isPublish,
      iconLevel: level.iconLevel,
      hexavalue: level.hexavalue || '#000000',
    });

    // Map benefits
    this.mapBenefitsToForm(level.loyaltyItemsWalletList, form);
  }

  /**
   * Map benefits from API to form
   */
  private mapBenefitsToForm(benefits: any[], form: FormGroup): void {
    const benefitsArray = this.getBenefitsArray(form);
    benefitsArray.clear();

    benefits.forEach(benefit => {
      const benefitGroup = this.fb.nonNullable.group({
        type: [benefit.itemCode],
        nameBenefit: [benefit.loyaltyNameWallet],
        descriptionBenefit: [benefit.loyaltyDescriptionWallet],
        priceDiscount: [this.mapDiscountValue(benefit)],
        active: [true], // API doesn't return benefit active status, default to true
        benefitIcon: [benefit.iconBenefit || ''],
        itemCode: [benefit.idLoyaltyItemWallet],
        isProduct: [benefit.isProduct],
        productsBenefits: this.fb.array([]),
      });

      // Map products if benefit has them
      if (benefit.loyaltyItemProducto && benefit.loyaltyItemProducto.length > 0) {
        const productsArray = benefitGroup.get('productsBenefits') as FormArray;

        benefit.loyaltyItemProducto.forEach((product: any) => {
          const productGroup = this.fb.nonNullable.group({
            codItemProduct: [product.codItemProduct || 0],
            brand: [product.brandId],
            productCode: [product.productCode],
            quantity: [product.quantity || 1],
            active: [product.active],
            levelcatLimit: [0],
            modifiersProducts: this.fb.array([]),
          });

          // Map modifiers if product has them
          if (product.loyaltyItemModifiers && product.loyaltyItemModifiers.length > 0) {
            const modifiersArray = productGroup.get('modifiersProducts') as FormArray;

            product.loyaltyItemModifiers.forEach((modifier: any) => {
              const modifierGroup = this.fb.nonNullable.group({
                codLoyaltyItemModifier: [modifier.codLoyaltyItemModifier],
                codItemProduct: [modifier.codItemProduct],
                modifierId: [modifier.modifierId],
                modifierCode: [modifier.modifierCode],
                quantity: [modifier.quantity],
                modifierActive: [modifier.active],
              });
              modifiersArray.push(modifierGroup);
            });
          }

          productsArray.push(productGroup);
        });
      }

      benefitsArray.push(benefitGroup);
    });
  }

  /**
   * Map discount value from API format
   * DP (percentage) comes as decimal (0.2 = 20%), needs to be converted to percentage
   * DF (fixed) comes as is
   */
  private mapDiscountValue(benefit: any): number {
    if (!benefit.discountValue) return 0;

    // If it's percentage discount, convert from decimal to percentage
    if (benefit.itemCode === 'DP') {
      return benefit.discountValue * 100;
    }

    // Fixed discount, return as is
    return benefit.discountValue;
  }

  /**
   * Add benefit to form
   */
  addBenefit(form: FormGroup): void {
    const benefitsArray = this.getBenefitsArray(form);
    benefitsArray.push(this.createBenefit());
  }

  /**
   * Remove benefit from form
   */
  removeBenefit(form: FormGroup, index: number): void {
    const benefitsArray = this.getBenefitsArray(form);
    benefitsArray.removeAt(index);
  }

  /**
   * Add product to benefit
   */
  addProduct(form: FormGroup, benefitIndex: number): void {
    const productsArray = this.getProductsArray(form, benefitIndex);
    productsArray.push(this.createProduct());
  }

  /**
   * Remove product from benefit
   */
  removeProduct(form: FormGroup, benefitIndex: number, productIndex: number): void {
    const productsArray = this.getProductsArray(form, benefitIndex);
    productsArray.removeAt(productIndex);
  }

  /**
   * Add modifier to product
   */
  addModifier(form: FormGroup, benefitIndex: number, productIndex: number): void {
    const modifiersArray = this.getModifiersArray(form, benefitIndex, productIndex);
    modifiersArray.push(this.createModifier());
  }

  /**
   * Remove modifier from product
   */
  removeModifier(
    form: FormGroup,
    benefitIndex: number,
    productIndex: number,
    modifierIndex: number
  ): void {
    const modifiersArray = this.getModifiersArray(form, benefitIndex, productIndex);
    if (modifierIndex < modifiersArray.length) {
      modifiersArray.removeAt(modifierIndex);
    }
  }

  /**
   * Get benefits array from form
   */
  getBenefitsArray(form: FormGroup): FormArray {
    return form.get('benefitsList') as FormArray;
  }

  /**
   * Get products array from benefit
   */
  getProductsArray(form: FormGroup, benefitIndex: number): FormArray {
    return form.get(['benefitsList', benefitIndex, 'productsBenefits']) as FormArray;
  }

  /**
   * Get modifiers array from product
   */
  getModifiersArray(form: FormGroup, benefitIndex: number, productIndex: number): FormArray {
    return form.get([
      'benefitsList',
      benefitIndex,
      'productsBenefits',
      productIndex,
      'modifiersProducts'
    ]) as FormArray;
  }

  /**
   * Validate entire form and return errors
   */
  validateForm(form: FormGroup): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (form.invalid) {
      form.markAllAsTouched();

      // Check basic fields
      Object.keys(form.controls).forEach(fieldName => {
        const field = form.get(fieldName);
        if (field?.invalid && (field.dirty || field.touched)) {
          const error = this.getFieldError(field);
          if (error) {
            errors.push(`${fieldName}: ${error}`);
          }
        }
      });
    }

    return { isValid: form.valid, errors };
  }

  /**
   * Validate point range against thresholds
   */
  validatePointRange(
    form: FormGroup,
    minPoints: number,
    maxPoints: number,
    isFirstLevel: boolean
  ): string | null {
    const formValues = form.value;

    if (formValues.maxPts <= formValues.requieredPts) {
      return 'Los puntos máximos deben ser mayores que los puntos requeridos';
    }

    if (formValues.requieredPts < minPoints || formValues.maxPts > maxPoints) {
      if (isFirstLevel) {
        return `Este nivel debe empezar con ${minPoints} puntos.`;
      } else {
        return `Este nivel debe de estar entre rango de puntos ${minPoints} y ${maxPoints}`;
      }
    }

    return null;
  }

  /**
   * Get error message for a form field
   */
  private getFieldError(field: any): string {
    if (field.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['min']) return 'El valor debe ser mayor a 0';
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  /**
   * Check if benefit type requires products
   */
  shouldShowProducts(form: FormGroup, benefitIndex: number): boolean {
    const benefitsArray = this.getBenefitsArray(form);
    const benefitType = benefitsArray.at(benefitIndex)?.get('type')?.value;
    return benefitType === 'PG' || benefitType === 'AG';
  }

  /**
   * Check if benefit type requires discount input
   */
  shouldShowDiscount(form: FormGroup, benefitIndex: number): boolean {
    const benefitsArray = this.getBenefitsArray(form);
    const benefitType = benefitsArray.at(benefitIndex)?.get('type')?.value;
    return benefitType === 'DF' || benefitType === 'DP';
  }

  /**
   * Get benefit title from code
   */
  getBenefitTitle(code: keyof typeof BenefitType): string {
    return BenefitType[code] ?? '';
  }

  /**
   * Transform form data to API format for PUT request
   */
  transformFormToApiFormat(formValues: any, levelId: number): any {
    const loyaltyItemWallet = formValues.benefitsList.map((benefit: any) => {
      // Calculate discount value for API
      let discountValue = null;
      if (benefit.type === 'DP' && benefit.priceDiscount) {
        // Convert percentage to decimal (20 -> 0.2)
        discountValue = benefit.priceDiscount / 100;
      } else if (benefit.type === 'DF' && benefit.priceDiscount) {
        // Fixed discount, send as is
        discountValue = benefit.priceDiscount;
      }

      const products = benefit.productsBenefits.map((product: any) => ({
        productId: product.codItemProduct || 0,
        brandId: product.brand,
        active: product.active,
        productCode: product.productCode,
        quantity: product.quantity || 1,
        loyaltyItemModifiers: product.modifiersProducts.map((modifier: any) => ({
          quantity: modifier.quantity || 1,
          active: modifier.modifierActive,
          publish: modifier.modifierActive,
          modifierCode: modifier.modifierCode
        }))
      }));

      return {
        loyaltyNameWallet: benefit.nameBenefit,
        loyaltyDescriptionWallet: benefit.descriptionBenefit,
        itemCount: benefit.type === 'EG' ? 0 : 1,
        itemValue: 0,
        isProduct: benefit.isProduct,
        active: benefit.active,
        publish: true,
        itemCode: benefit.type,
        discountValue: discountValue,
        itemIcon: benefit.benefitIcon || '',
        loyaltyItemProducto: products
      };
    });

    return {
      loyaltyLevelName: formValues.levelName,
      minPointsLevel: formValues.requieredPts,
      maxPointsLevel: formValues.maxPts,
      iconLevel: formValues.iconLevel,
      inOrder: 0, // This might need to be calculated
      isActive: formValues.isActive,
      isPublish: formValues.isPublish,
      hexavalue: formValues.hexavalue || '#000000',
      messageLevel: formValues.levelDesc,
      convertFactor: formValues.convertFactor || 0,
      factorValue: 0,
      loyaltyItemWallet: loyaltyItemWallet
    };
  }
}
