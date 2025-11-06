import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { AppConfigService } from '../../services';
import { SecurityModalComponent } from '../../components/security-modal/security-modal.component';
import { type Config, type ConfigUpdate, type PinMethod } from '../../models';

/**
 * AppConfigPageComponent
 *
 * Page for managing application-wide configurations
 * Features:
 * - General configurations (distances, times, payment options)
 * - PIN delivery methods (WhatsApp, Email, SMS)
 * - Order configurations (titles, tooltips, 3DS URLs, split payments)
 * - Security confirmation modal with random code
 */
@Component({
  selector: 'app-app-config-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BreadcrumbModule,
    ButtonModule,
    AccordionModule,
    InputTextModule,
    TextareaModule,
    ToggleSwitchModule,
    CheckboxModule,
    MessageModule,
    SecurityModalComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto p-6">
      <!-- Breadcrumb -->
      <p-breadcrumb [model]="breadcrumbItems" [home]="breadcrumbHome" styleClass="mb-4" />

      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">
            <i class="pi pi-cog mr-3 text-primary"></i>
            Configuración de App
          </h1>
          <p class="text-gray-600 mt-2">
            Gestiona configuraciones globales de la aplicación cliente
          </p>
        </div>

        <p-button
          label="Guardar Cambios"
          icon="pi pi-save"
          [loading]="isLoading()"
          [disabled]="!configForm || configForm.invalid || !hasChanges()"
          (onClick)="openSecurityModal()"
        />
      </div>

      <!-- Info Alert -->
      <p-message severity="info" styleClass="mb-6 w-full">
        <div class="flex items-start gap-3">
          <i class="pi pi-info-circle text-xl"></i>
          <div class="text-sm">
            <p class="font-semibold mb-1">Importante</p>
            <p>
              Los cambios en esta sección afectan directamente a la aplicación cliente.
              Se requiere confirmación de seguridad antes de guardar.
            </p>
          </div>
        </div>
      </p-message>

      <!-- Configuration Form -->
      @if (configForm) {
        <form [formGroup]="configForm">
          <p-accordion [multiple]="true" [value]="['0', '1', '2']">
            <!-- Section 1: General Configurations -->
            <p-accordion-panel value="0">
              <p-accordion-header>Configuraciones Generales</p-accordion-header>
              <p-accordion-content>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6" formGroupName="generalConfigs">
                <!-- Near Distance Threshold -->
                <div class="flex flex-col gap-2">
                  <label for="nearDistanceThreshold" class="font-semibold text-gray-700">
                    Umbral de Distancia Cercana (metros)
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    pInputText
                    id="nearDistanceThreshold"
                    formControlName="nearDistanceThreshold"
                    type="number"
                    min="0"
                    placeholder="Ej: 500"
                    class="w-full"
                  />
                  @if (configForm.get('generalConfigs.nearDistanceThreshold')?.invalid && configForm.get('generalConfigs.nearDistanceThreshold')?.touched) {
                    <small class="text-red-600">Campo requerido</small>
                  }
                </div>

                <!-- Alert Display Time -->
                <div class="flex flex-col gap-2">
                  <label for="alertDisplayTime" class="font-semibold text-gray-700">
                    Tiempo de Visualización de Alerta (segundos)
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    pInputText
                    id="alertDisplayTime"
                    formControlName="alertDisplayTime"
                    type="number"
                    min="0"
                    placeholder="Ej: 5"
                    class="w-full"
                  />
                  @if (configForm.get('generalConfigs.alertDisplayTime')?.invalid && configForm.get('generalConfigs.alertDisplayTime')?.touched) {
                    <small class="text-red-600">Campo requerido</small>
                  }
                </div>

                <!-- Can Scan Payment Card -->
                <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <p-toggleSwitch formControlName="canScanPaymentCard" />
                  <label class="font-medium text-gray-700 cursor-pointer">
                    Permitir escaneo de tarjeta de pago
                  </label>
                </div>

                <!-- Use Luhn Algorithm -->
                <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <p-toggleSwitch formControlName="useLuhnAlgorithm" />
                  <label class="font-medium text-gray-700 cursor-pointer">
                    Usar algoritmo de Luhn
                  </label>
                </div>
              </div>
              </p-accordion-content>
            </p-accordion-panel>

            <!-- Section 2: PIN Methods -->
            <p-accordion-panel value="1">
              <p-accordion-header>Métodos de Envío de PIN</p-accordion-header>
              <p-accordion-content>
              <div formArrayName="pinMethods" class="space-y-6">
                @for (method of pinMethodsArray.controls; track $index) {
                  <div [formGroupName]="$index" class="p-4 border border-gray-200 rounded-lg">
                    <div class="flex items-center gap-3 mb-4">
                      <img
                        [src]="method.get('icon')?.value"
                        [alt]="method.get('title')?.value"
                        class="w-8 h-8 object-contain"
                      />
                      <h3 class="text-lg font-semibold text-gray-800">
                        {{ method.get('title')?.value }}
                      </h3>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="flex items-center gap-3">
                        <p-checkbox
                          formControlName="showInScreen"
                          [binary]="true"
                          [inputId]="'showInScreen' + $index"
                        />
                        <label [for]="'showInScreen' + $index" class="cursor-pointer">
                          Mostrar en pantalla
                        </label>
                      </div>

                      <div class="flex items-center gap-3">
                        <p-checkbox
                          formControlName="showInResend"
                          [binary]="true"
                          [inputId]="'showInResend' + $index"
                        />
                        <label [for]="'showInResend' + $index" class="cursor-pointer">
                          Permitir reenvío
                        </label>
                      </div>
                    </div>
                  </div>
                }

                @if (pinMethodsArray.errors?.['minOnePinMethod']) {
                  <p-message severity="error" styleClass="mt-4 w-full">
                    Debe seleccionar al menos un método de envío de PIN
                  </p-message>
                }
                @if (pinMethodsArray.errors?.['maxTwoPinMethods']) {
                  <p-message severity="error" styleClass="mt-4 w-full">
                    Máximo dos métodos de envío de PIN permitidos
                  </p-message>
                }
              </div>
              </p-accordion-content>
            </p-accordion-panel>

            <!-- Section 3: Order Configurations -->
            <p-accordion-panel value="2">
              <p-accordion-header>Configuraciones de Órdenes</p-accordion-header>
              <p-accordion-content>
              <div class="space-y-6" formGroupName="orderConfigs">
                <!-- Titles -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="flex flex-col gap-2">
                    <label for="dynamicValueTitle" class="font-semibold text-gray-700">
                      Título Dinámico
                    </label>
                    <input
                      pInputText
                      id="dynamicValueTitle"
                      formControlName="dynamicValueTitle"
                      placeholder="Título dinámico de la orden"
                      class="w-full"
                    />
                  </div>

                  <div class="flex flex-col gap-2">
                    <label for="lateNightTitle" class="font-semibold text-gray-700">
                      Título Nocturno
                    </label>
                    <input
                      pInputText
                      id="lateNightTitle"
                      formControlName="lateNightTitle"
                      placeholder="Título para órdenes nocturnas"
                      class="w-full"
                    />
                  </div>
                </div>

                <!-- Tooltips -->
                <div class="grid grid-cols-1 gap-6">
                  <div class="flex flex-col gap-2">
                    <label for="expressDeliveryToolTip" class="font-semibold text-gray-700">
                      Tooltip Express Delivery
                    </label>
                    <textarea
                      pTextarea
                      id="expressDeliveryToolTip"
                      formControlName="expressDeliveryToolTip"
                      rows="3"
                      placeholder="Texto del tooltip para express delivery"
                      class="w-full"
                    ></textarea>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label for="kitchenNotesToolTip" class="font-semibold text-gray-700">
                      Tooltip Kitchen Notes
                    </label>
                    <textarea
                      pTextarea
                      id="kitchenNotesToolTip"
                      formControlName="kitchenNotesToolTip"
                      rows="3"
                      placeholder="Texto del tooltip para notas de cocina"
                      class="w-full"
                    ></textarea>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label for="deliveryNotesToolTip" class="font-semibold text-gray-700">
                      Tooltip Delivery Notes
                    </label>
                    <textarea
                      pTextarea
                      id="deliveryNotesToolTip"
                      formControlName="deliveryNotesToolTip"
                      rows="3"
                      placeholder="Texto del tooltip para notas de entrega"
                      class="w-full"
                    ></textarea>
                  </div>
                </div>

                <!-- 3D Secure URLs -->
                <div class="flex flex-col gap-3">
                  <label class="font-semibold text-gray-700">URLs Seguras 3DS</label>
                  <div formArrayName="3DSecureUrls" class="space-y-2">
                    @for (url of secureUrlsArray.controls; track $index) {
                      <div class="flex items-center gap-3">
                        <input
                          pInputText
                          [formControlName]="$index"
                          [readonly]="isExistingUrl($index)"
                          [class.bg-gray-100]="isExistingUrl($index)"
                          placeholder="https://example.com"
                          class="flex-1"
                        />
                        @if (isExistingUrl($index)) {
                          <i class="pi pi-lock text-gray-400" pTooltip="URL existente (solo lectura)"></i>
                        }
                      </div>
                    }
                  </div>
                  <p-button
                    label="Agregar Nueva URL"
                    icon="pi pi-plus"
                    severity="secondary"
                    [outlined]="true"
                    size="small"
                    (onClick)="addNewSecureUrl()"
                  />
                  <small class="text-gray-500">
                    Las URLs existentes no se pueden modificar. Solo puedes agregar nuevas URLs.
                  </small>
                </div>

                <!-- Split Payment Options -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <p-toggleSwitch formControlName="splitPaymentAvailableInDelivery" />
                    <label class="font-medium text-gray-700 cursor-pointer">
                      Pago dividido en Delivery
                    </label>
                  </div>

                  <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <p-toggleSwitch formControlName="splitPaymentAvailableInPickup" />
                    <label class="font-medium text-gray-700 cursor-pointer">
                      Pago dividido en Pickup
                    </label>
                  </div>
                </div>
              </div>
              </p-accordion-content>
            </p-accordion-panel>
          </p-accordion>
        </form>
      }

      <!-- Loading State -->
      @if (isLoading() && !configForm) {
        <div class="flex flex-col items-center justify-center py-16">
          <i class="pi pi-spin pi-spinner text-4xl text-primary mb-4"></i>
          <p class="text-gray-500">Cargando configuraciones...</p>
        </div>
      }
    </div>

    <!-- Security Modal -->
    <app-security-modal
      [visible]="showSecurityModal()"
      [securityCode]="securityCode()"
      (onConfirmChanges)="saveChanges()"
      (onCancelChanges)="closeSecurityModal()"
      (visibleChange)="showSecurityModal.set($event)"
    />
  `
})
export class AppConfigPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly configService = inject(AppConfigService);

  // State
  readonly isLoading = this.configService.isLoading;
  readonly showSecurityModal = signal(false);
  readonly securityCode = signal('');
  private originalConfig: Config | null = null;
  private originalUrlsCount = 0;

  // Form
  configForm!: FormGroup;

  // Computed
  readonly hasChanges = computed(() => {
    if (!this.configForm || !this.originalConfig) return false;
    const changes = this.detectChanges();
    return Object.keys(changes).length > 0;
  });

  // Breadcrumb
  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Mantenimiento', routerLink: '/maintenance' },
    { label: 'Configuración de App' }
  ];

  // Form getters
  get pinMethodsArray(): FormArray {
    return this.configForm.get('pinMethods') as FormArray;
  }

  get secureUrlsArray(): FormArray {
    return this.configForm.get('orderConfigs.3DSecureUrls') as FormArray;
  }

  ngOnInit(): void {
    this.loadConfigurations();
  }

  /**
   * Load configurations from API
   */
  private loadConfigurations(): void {
    this.configService.getConfigurations().subscribe({
      next: (config) => {
        this.originalConfig = config;
        this.originalUrlsCount = config.orderConfigs['3DSecureUrls'].length;
        this.initializeForm(config);
      },
      error: (error) => {
        console.error('Error loading configurations:', error);
      }
    });
  }

  /**
   * Initialize form with data
   */
  private initializeForm(config: Config): void {
    this.configForm = this.fb.group({
      generalConfigs: this.fb.group({
        nearDistanceThreshold: [config.generalConfigs.nearDistanceThreshold, [Validators.required, Validators.min(0)]],
        alertDisplayTime: [config.generalConfigs.alertDisplayTime, [Validators.required, Validators.min(0)]],
        canScanPaymentCard: [config.generalConfigs.canScanPaymentCard],
        useLuhnAlgorithm: [config.generalConfigs.useLuhnAlgorithm]
      }),
      pinMethods: this.fb.array(
        config.pinMethods.map(method => this.createPinMethodGroup(method)),
        [this.pinMethodsValidator()]
      ),
      orderConfigs: this.fb.group({
        dynamicValueTitle: [config.orderConfigs.dynamicValueTitle],
        lateNightTitle: [config.orderConfigs.lateNightTitle],
        expressDeliveryToolTip: [config.orderConfigs.expressDeliveryToolTip],
        kitchenNotesToolTip: [config.orderConfigs.kitchenNotesToolTip],
        deliveryNotesToolTip: [config.orderConfigs.deliveryNotesToolTip],
        '3DSecureUrls': this.fb.array(
          config.orderConfigs['3DSecureUrls'].map(url => this.fb.control(url))
        ),
        splitPaymentAvailableInDelivery: [config.orderConfigs.splitPaymentAvailableInDelivery],
        splitPaymentAvailableInPickup: [config.orderConfigs.splitPaymentAvailableInPickup]
      })
    });
  }

  /**
   * Create PIN method form group
   */
  private createPinMethodGroup(method: PinMethod): FormGroup {
    return this.fb.group({
      type: [method.type],
      title: [method.title],
      showInScreen: [method.showInScreen],
      showInResend: [method.showInResend],
      icon: [method.icon]
    });
  }

  /**
   * Custom validator for PIN methods (1-2 methods must be selected)
   */
  private pinMethodsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formArray = control as FormArray;
      const selectedMethods = formArray.controls.filter(group => {
        const showInScreen = group.get('showInScreen')?.value;
        const showInResend = group.get('showInResend')?.value;
        return showInScreen || showInResend;
      }).length;

      if (selectedMethods < 1) {
        return { minOnePinMethod: true };
      }
      if (selectedMethods > 2) {
        return { maxTwoPinMethods: true };
      }
      return null;
    };
  }

  /**
   * Check if URL is an existing one (readonly)
   */
  isExistingUrl(index: number): boolean {
    return index < this.originalUrlsCount;
  }

  /**
   * Add new secure URL
   */
  addNewSecureUrl(): void {
    this.secureUrlsArray.push(this.fb.control(''));
  }

  /**
   * Detect changes between form and original config
   */
  private detectChanges(): ConfigUpdate {
    if (!this.originalConfig) return {};

    const formValue = this.configForm.value;
    const changes: ConfigUpdate = {};

    // Check general configs
    const generalChanges: Partial<typeof formValue.generalConfigs> = {};
    if (formValue.generalConfigs.nearDistanceThreshold !== this.originalConfig.generalConfigs.nearDistanceThreshold) {
      generalChanges['nearDistanceThreshold'] = formValue.generalConfigs.nearDistanceThreshold;
    }
    if (formValue.generalConfigs.alertDisplayTime !== this.originalConfig.generalConfigs.alertDisplayTime) {
      generalChanges['alertDisplayTime'] = formValue.generalConfigs.alertDisplayTime;
    }
    if (formValue.generalConfigs.canScanPaymentCard !== this.originalConfig.generalConfigs.canScanPaymentCard) {
      generalChanges['canScanPaymentCard'] = formValue.generalConfigs.canScanPaymentCard;
    }
    if (formValue.generalConfigs.useLuhnAlgorithm !== this.originalConfig.generalConfigs.useLuhnAlgorithm) {
      generalChanges['useLuhnAlgorithm'] = formValue.generalConfigs.useLuhnAlgorithm;
    }
    if (Object.keys(generalChanges).length > 0) {
      changes.generalConfigs = generalChanges;
    }

    // Check pin methods (check all, always include if any changed)
    let pinMethodsChanged = false;
    for (let i = 0; i < formValue.pinMethods.length; i++) {
      const formMethod = formValue.pinMethods[i];
      const originalMethod = this.originalConfig.pinMethods[i];
      if (
        formMethod.showInScreen !== originalMethod.showInScreen ||
        formMethod.showInResend !== originalMethod.showInResend
      ) {
        pinMethodsChanged = true;
        break;
      }
    }
    if (pinMethodsChanged) {
      changes.pinMethods = formValue.pinMethods;
    }

    // Check order configs
    const orderChanges: Partial<typeof formValue.orderConfigs> = {};
    if (formValue.orderConfigs.dynamicValueTitle !== this.originalConfig.orderConfigs.dynamicValueTitle) {
      orderChanges['dynamicValueTitle'] = formValue.orderConfigs.dynamicValueTitle;
    }
    if (formValue.orderConfigs.lateNightTitle !== this.originalConfig.orderConfigs.lateNightTitle) {
      orderChanges['lateNightTitle'] = formValue.orderConfigs.lateNightTitle;
    }
    if (formValue.orderConfigs.expressDeliveryToolTip !== this.originalConfig.orderConfigs.expressDeliveryToolTip) {
      orderChanges['expressDeliveryToolTip'] = formValue.orderConfigs.expressDeliveryToolTip;
    }
    if (formValue.orderConfigs.kitchenNotesToolTip !== this.originalConfig.orderConfigs.kitchenNotesToolTip) {
      orderChanges['kitchenNotesToolTip'] = formValue.orderConfigs.kitchenNotesToolTip;
    }
    if (formValue.orderConfigs.deliveryNotesToolTip !== this.originalConfig.orderConfigs.deliveryNotesToolTip) {
      orderChanges['deliveryNotesToolTip'] = formValue.orderConfigs.deliveryNotesToolTip;
    }
    if (formValue.orderConfigs.splitPaymentAvailableInDelivery !== this.originalConfig.orderConfigs.splitPaymentAvailableInDelivery) {
      orderChanges['splitPaymentAvailableInDelivery'] = formValue.orderConfigs.splitPaymentAvailableInDelivery;
    }
    if (formValue.orderConfigs.splitPaymentAvailableInPickup !== this.originalConfig.orderConfigs.splitPaymentAvailableInPickup) {
      orderChanges['splitPaymentAvailableInPickup'] = formValue.orderConfigs.splitPaymentAvailableInPickup;
    }

    // Check for new 3DS URLs (only send new ones)
    const newUrls = formValue.orderConfigs['3DSecureUrls']
      .slice(this.originalUrlsCount)
      .filter((url: string) => url && url.trim());
    if (newUrls.length > 0) {
      orderChanges['3DSecureUrls'] = newUrls;
    }

    if (Object.keys(orderChanges).length > 0) {
      changes.orderConfigs = orderChanges;
    }

    return changes;
  }

  /**
   * Generate random security code
   */
  private generateSecurityCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Open security modal
   */
  openSecurityModal(): void {
    this.securityCode.set(this.generateSecurityCode());
    this.showSecurityModal.set(true);
  }

  /**
   * Close security modal
   */
  closeSecurityModal(): void {
    this.showSecurityModal.set(false);
    this.securityCode.set('');
  }

  /**
   * Save changes
   */
  saveChanges(): void {
    const changes = this.detectChanges();

    this.configService.updateConfigurations(changes).subscribe({
      next: () => {
        this.closeSecurityModal();
        // Configuration will be reloaded automatically by the service
      },
      error: (error) => {
        console.error('Error saving configurations:', error);
        this.closeSecurityModal();
      }
    });
  }
}
