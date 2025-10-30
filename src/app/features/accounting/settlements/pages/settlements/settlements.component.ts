import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem, MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

// Services and models
import { SettlementService } from '../../services/settlement.service';
import {
  Order,
  BrandsList,
  HQList,
  SettlementRequest,
} from '../../models/settlement.model';

@Component({
  selector: 'app-settlements',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    CardModule,
    TableModule,
    TagModule,
    SkeletonModule,
    ToastModule,
    BreadcrumbModule,
  ],
  templateUrl: './settlements.component.html',
  styleUrl: './settlements.component.scss',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettlementsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly settlementService = inject(SettlementService);
  private readonly messageService = inject(MessageService);

  // Breadcrumb
  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Contabilidad', routerLink: '/accounting' },
    { label: 'Liquidaciones' },
  ];

  // Signals
  readonly searchValue = signal<string>('');
  readonly order = signal<Order | null>(null);
  readonly brandsList = signal<BrandsList[]>([]);
  readonly hqList = signal<HQList[]>([]);
  readonly isActiveProcess = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);

  // Computed
  readonly canSettle = computed(() => {
    const currentOrder = this.order();
    return currentOrder?.orderStatusId === 8;
  });

  readonly orderStatusSeverity = computed(() => {
    const statusId = this.order()?.orderStatusId;
    if (!statusId) return 'info';
    if (statusId === 8) return 'success'; // Entregado
    if (statusId === 7) return 'warn'; // En camino
    if (statusId < 7) return 'info'; // En proceso
    return 'danger'; // Cancelado u otro
  });

  // Form
  readonly settlementForm: FormGroup = this.fb.group({
    brand: [null as number | null, Validators.required],
    unit: [{ value: null as number | null, disabled: true }, Validators.required],
    city: [{ value: null as number | null, disabled: true }],
    driver: [{ value: '', disabled: true }],
    date: [new Date(), [Validators.required, this.notFutureDateValidator]],
    comment: ['', Validators.maxLength(500)],
  });

  constructor() {
    // Escuchar cambios en brand para cargar unidades
    this.settlementForm
      .get('brand')
      ?.valueChanges.pipe(
        filter((brandId) => !!brandId),
        switchMap((brandId) => {
          // Habilitar el campo de unidad
          this.settlementForm.get('unit')?.enable();
          // Reset el valor de unidad
          this.settlementForm.get('unit')?.setValue(null);
          return this.settlementService.getHQList(brandId!);
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (units) => this.hqList.set(units),
        error: (error) => {
          console.error('Error loading units:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las unidades',
          });
        },
      });
  }

  ngOnInit(): void {
    this.loadBrands();
  }

  /**
   * Cargar lista de marcas
   */
  private loadBrands(): void {
    this.settlementService.getBrands().subscribe({
      next: (brands) => this.brandsList.set(brands),
      error: (error) => {
        console.error('Error loading brands:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las marcas',
        });
      },
    });
  }

  /**
   * Buscar orden por número
   */
  searchOrder(): void {
    const orderNumber = this.searchValue().trim();

    if (!orderNumber) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor ingrese un número de orden',
      });
      return;
    }

    this.isLoading.set(true);
    this.settlementService.getOrder(orderNumber).subscribe({
      next: (order) => {
        this.order.set(order);
        this.settlementForm.patchValue({ city: order.cityId });
        this.isLoading.set(false);

        if (!this.canSettle()) {
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'Esta orden no puede ser liquidada. Debe estar en estado "Entregada"',
          });
        }
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.order.set(null);
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se encontró la orden o ocurrió un error',
        });
      },
    });
  }

  /**
   * Alternar vista de proceso de liquidación
   */
  toggleProcess(): void {
    const currentOrder = this.order();

    if (!currentOrder) return;

    this.isActiveProcess.update((value) => !value);

    if (this.isActiveProcess()) {
      // Poblar información del conductor
      this.settlementForm.patchValue({
        driver: `${currentOrder.nameDriver} (ID: ${currentOrder.idDriver})`,
        city: currentOrder.cityId,
      });
    } else {
      // Resetear formulario al cancelar
      this.settlementForm.reset({
        brand: null,
        unit: null,
        city: currentOrder.cityId,
        driver: `${currentOrder.nameDriver} (ID: ${currentOrder.idDriver})`,
        date: new Date(),
        comment: '',
      });
      this.hqList.set([]);
    }
  }

  /**
   * Enviar liquidación
   */
  submitSettlement(): void {
    if (this.settlementForm.invalid) {
      this.settlementForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor complete todos los campos requeridos',
      });
      return;
    }

    const currentOrder = this.order();
    if (!currentOrder) return;

    const formValue = this.settlementForm.getRawValue();

    const request: SettlementRequest = {
      orderId: currentOrder.numOrder,
      brandId: formValue.brand,
      restaurantId: formValue.unit,
      cityId: formValue.city,
      driverId: currentOrder.idDriver,
      settlementDate: new Date(formValue.date).toISOString(),
      comment: formValue.comment || undefined,
    };

    this.isSubmitting.set(true);

    this.settlementService.submitSettlement(request).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: response.message || 'Liquidación creada exitosamente',
        });

        // Resetear vista
        this.isActiveProcess.set(false);
        this.order.set(null);
        this.searchValue.set('');
        this.settlementForm.reset({ date: new Date() });
      },
      error: (error) => {
        console.error('Error submitting settlement:', error);
        this.isSubmitting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo crear la liquidación. Intente nuevamente.',
        });
      },
    });
  }

  /**
   * Validador custom: fecha no debe ser futura
   */
  private notFutureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return selectedDate > today ? { futureDate: true } : null;
  }

  /**
   * Calcular total de productos
   */
  calculateTotal(): number {
    const currentOrder = this.order();
    if (!currentOrder?.ordersProductsDetails) return 0;

    return currentOrder.ordersProductsDetails.reduce(
      (sum, product) => sum + product.total,
      0
    );
  }

  /**
   * Calcular total de pagos
   */
  calculatePaymentTotal(): number {
    const currentOrder = this.order();
    if (!currentOrder?.paidDetails) return 0;

    return currentOrder.paidDetails.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
  }
}
