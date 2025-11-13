import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  OnInit,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { MenuItem, MessageService } from 'primeng/api';

import { LoyaltyService, LoyaltyFormService } from '../../services';
import { Brand, BenefitCode, BenefitType } from '../../models';
import { BenefitSelectorComponent } from '../../components';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-level-detail-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    SelectModule,
    BreadcrumbModule,
    ToastModule,
    DividerModule,
    TableModule,
    TagModule,
    BenefitSelectorComponent
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './level-detail-page.component.html',
  styleUrl: './level-detail-page.component.scss'
})
export class LevelDetailPageComponent implements OnInit {
  private readonly loyaltyService = inject(LoyaltyService);
  private readonly formService = inject(LoyaltyFormService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // Breadcrumb
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Gest. Notificaciones', routerLink: '/notification-managements' },
    { label: 'Programa de Lealtad', routerLink: '/notification-managements/loyalty-program' },
    { label: 'Detalle' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // State signals
  readonly form = signal<FormGroup>(this.formService.createLoyaltyForm());
  readonly brands = signal<Brand[]>([]);
  readonly benefitTypes = signal<BenefitCode[]>([]);
  readonly minPoints = signal<number>(0);
  readonly maxPoints = signal<number>(0);
  readonly levelId = signal<number>(0);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isEditMode = signal(false);

  // Computed
  readonly pageTitle = computed(() =>
    this.isEditMode() ? 'Editar Nivel de Lealtad' : 'Crear Nivel de Lealtad'
  );

  ngOnInit(): void {
    this.loadInitialData();
    this.handleRouteParams();
  }

  /**
   * Load brands and benefit types
   */
  private loadInitialData(): void {
    // Load brands
    this.loyaltyService.getBrands().subscribe({
      next: (brands) => {
        this.brands.set(brands);
      },
      error: (error: unknown) => {
        console.error('Error loading brands:', error);
      }
    });

    // Load benefit types
    this.loyaltyService.getBenefitTypes().subscribe({
      next: (types) => {
        this.benefitTypes.set(types);
      },
      error: (error: unknown) => {
        console.error('Error loading benefit types:', error);
      }
    });
  }

  /**
   * Handle route parameters
   */
  private handleRouteParams(): void {
    this.route.params.subscribe((params) => {
      const maxPointsParam = params['maxPoints'];
      const minPointsParam = params['minPoints'];
      const id = params['id'];

      if (id) {
        // Edit mode
        this.isEditMode.set(true);
        this.levelId.set(Number(id));
        this.minPoints.set(Number(minPointsParam));
        this.maxPoints.set(Number(maxPointsParam));
        this.loadLevelData(Number(id));
      } else {
        // Create mode
        this.isEditMode.set(false);
        this.minPoints.set(Number(maxPointsParam));
        this.maxPoints.set(999999); // Max possible points

        // Set default min points in form
        this.form().patchValue({
          requieredPts: Number(maxPointsParam)
        });
      }
    });
  }

  /**
   * Load level data for editing
   */
  private loadLevelData(levelId: number): void {
    this.isLoading.set(true);

    this.loyaltyService.getLevelById(levelId).subscribe({
      next: (level) => {
        this.formService.mapLevelToForm(level, this.form());
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        console.error('Error loading level:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el nivel de lealtad'
        });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Get benefits form array
   */
  get benefitsArray(): FormArray {
    return this.formService.getBenefitsArray(this.form());
  }

  /**
   * Remove benefit from form
   */
  onRemoveBenefit(index: number): void {
    this.formService.removeBenefit(this.form(), index);
    // Force change detection to update the table
    this.cdr.markForCheck();
  }

  /**
   * Get table data for benefits
   */
  getBenefitsTableData(): any[] {
    return this.benefitsArray.controls.map((control, index) => {
      const value = control.value;
      const productsArray = control.get('productsBenefits') as FormArray;

      // Extract ALL products details if exists
      let productDetails: any[] = [];
      if (productsArray && productsArray.length > 0) {
        productDetails = productsArray.controls.map((productControl, prodIndex) => {
          const product = productControl.value;
          const modifiersArray = productControl.get('modifiersProducts') as FormArray;

          // Get brand name
          const brand = this.brands().find(b => b.idBrand === product.brand);

          return {
            productIndex: prodIndex,
            brandName: brand?.nameBrand || 'N/A',
            productCode: product.productCode,
            quantity: product.quantity,
            active: product.active,
            modifiers: modifiersArray ? modifiersArray.controls.map(mod => {
              const modValue = mod.value;
              return {
                modifierId: modValue.modifierId,
                modifierCode: modValue.modifierCode,
                quantity: modValue.quantity,
                active: modValue.modifierActive
              };
            }) : []
          };
        });
      }

      return {
        index,
        type: value.type,
        typeLabel: this.getBenefitTypeLabel(value.type),
        name: value.nameBenefit,
        description: value.descriptionBenefit,
        discount: value.priceDiscount || 0,
        productCount: productsArray?.length || 0,
        active: value.active,
        productDetails
      };
    });
  }

  /**
   * Get benefit type label
   */
  getBenefitTypeLabel(code: string): string {
    const labels: Record<string, string> = {
      'EG': 'Envío Gratis',
      'AG': 'Aperitivo Gratis',
      'PG': 'Postres Gratis',
      'DF': 'Descuento Fijo',
      'DP': 'Descuento %',
    };
    return labels[code] || code;
  }

  /**
   * Get severity color for benefit type tag
   */
  getBenefitSeverity(code: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      'EG': 'success',
      'AG': 'info',
      'PG': 'warn',
      'DF': 'danger',
      'DP': 'secondary',
    };
    return severities[code] || 'secondary';
  }

  /**
   * Validate and save form
   */
  onSave(): void {
    // Validate form
    const validation = this.formService.validateForm(this.form());

    if (!validation.isValid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Por favor complete todos los campos requeridos'
      });
      return;
    }

    // Validate point range
    const pointsError = this.formService.validatePointRange(
      this.form(),
      this.minPoints(),
      this.maxPoints(),
      !this.isEditMode()
    );

    if (pointsError) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación de Puntos',
        detail: pointsError
      });
      return;
    }

    this.isSaving.set(true);

    // Transform form data
    const levelData = this.formService.transformFormToApiFormat(
      this.form().value,
      this.levelId()
    );

    // Call appropriate service method
    const request = this.isEditMode()
      ? this.loyaltyService.updateLevel(this.levelId(), levelData)
      : this.loyaltyService.createLevel(levelData);

    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Nivel ${this.isEditMode() ? 'actualizado' : 'creado'} correctamente`
        });
        this.isSaving.set(false);

        // Navigate back to list
        setTimeout(() => {
          this.router.navigate(['/notification-managements/loyalty-program']);
        }, 1000);
      },
      error: (error: unknown) => {
        console.error('Error saving level:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo ${this.isEditMode() ? 'actualizar' : 'crear'} el nivel`
        });
        this.isSaving.set(false);
      }
    });
  }

  /**
   * Cancel and go back
   */
  onCancel(): void {
    this.router.navigate(['/notification-managements/loyalty-program']);
  }
}
