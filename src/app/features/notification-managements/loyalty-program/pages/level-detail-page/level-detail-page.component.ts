import {
  Component,
  ChangeDetectionStrategy,
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
import { ProductSelectorComponent } from '../../components';

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
    ProductSelectorComponent
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

  // Benefit type options for dropdown
  readonly benefitTypeOptions = [
    { label: 'Envío Gratis', value: 'EG' },
    { label: 'Aperitivo Gratis', value: 'AG' },
    { label: 'Postres Gratis', value: 'PG' },
    { label: 'Descuento Fijo', value: 'DF' },
    { label: 'Descuento Porcentual', value: 'DP' }
  ];

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
   * Add benefit to form
   */
  onAddBenefit(): void {
    this.formService.addBenefit(this.form());
  }

  /**
   * Remove benefit from form
   */
  onRemoveBenefit(index: number): void {
    this.formService.removeBenefit(this.form(), index);
  }

  /**
   * Check if benefit type requires product selection
   */
  shouldShowProducts(index: number): boolean {
    return this.formService.shouldShowProducts(this.form(), index);
  }

  /**
   * Check if benefit type requires discount input
   */
  shouldShowDiscount(index: number): boolean {
    return this.formService.shouldShowDiscount(this.form(), index);
  }

  /**
   * Get benefit title
   */
  getBenefitTitle(code: keyof typeof BenefitType): string {
    return this.formService.getBenefitTitle(code);
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
