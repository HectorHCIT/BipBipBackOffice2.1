import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  computed,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { GlobalDataService } from '@core/services/global-data.service';
import { Brand, Channel, CityShort } from '@core/models/global-data.model';
import { AppLinkService } from '../../services';
import { AppLinkPreviewComponent } from '../../components';
import { ProductData, DynamicLinkProduct } from '../../models';

@Component({
  selector: 'app-app-link-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    SelectModule,
    ToggleSwitchModule,
    ToastModule,
    TextareaModule,
    IconFieldModule,
    InputIconModule,
    AppLinkPreviewComponent,
  ],
  providers: [MessageService],
  templateUrl: './app-link-form.component.html',
  styleUrls: ['./app-link-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLinkFormComponent implements OnInit, OnChanges {
  private readonly appLinkService = inject(AppLinkService);
  private readonly globalDataService = inject(GlobalDataService);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  // Inputs
  readonly appLink = input<DynamicLinkProduct | null>(null);

  // Outputs
  readonly save = output<void>();
  readonly cancel = output<void>();

  readonly isLoading = signal(false);
  readonly formValueChanged = signal(0); // Signal to track form changes

  // Global data from GlobalDataService
  readonly brands = this.globalDataService.brands;
  readonly channels = this.globalDataService.channels;
  readonly cities = this.globalDataService.citiesShort;

  // Component-specific data
  readonly products = signal<ProductData[]>([]);

  // Computed: selected brand name
  readonly selectedBrandName = computed(() => {
    // Trigger recomputation when form changes
    this.formValueChanged();

    const brandId = this.appLinkForm.get('brandId')?.value;
    if (!brandId) return '';

    const brand = this.brands().find(b => b.id === brandId);
    return brand?.name || '';
  });

  // Computed: pending fields count
  readonly pendingFieldsCount = computed(() => {
    // Trigger recomputation when form changes
    this.formValueChanged();

    const form = this.appLinkForm;
    let pendingCount = 0;

    // Required fields
    if (!form.get('campaignName')?.value) pendingCount++;
    if (!form.get('title')?.value) pendingCount++;
    if (!form.get('description')?.value) pendingCount++;
    if (!form.get('brandId')?.value) pendingCount++;
    if (!form.get('productCode')?.value) pendingCount++;
    if (!form.get('imageUrl')?.value) pendingCount++;

    return pendingCount;
  });

  readonly appLinkForm = this.fb.nonNullable.group({
    campaignName: ['', [Validators.required, Validators.maxLength(100)]],
    title: ['', [Validators.required, Validators.maxLength(60), this.noSpecialCharactersValidator]],
    description: ['', [Validators.required, Validators.maxLength(200)]],
    brandId: [0 as number | null, Validators.required],
    productCode: ['', Validators.required],
    urlDynamicLink: ['https://www.bips.com/'],  // Hidden field with default value
    imageUrl: ['', Validators.required],
    useCustomImage: [false],
    customImageFile: [null as File | null],
    channelId: [null as number | null],
    cityId: [null as number | null],
    isActive: [true],
  });

  ngOnInit(): void {
    // Asegurar que los catálogos globales estén cargados
    this.ensureGlobalDataLoaded();

    // Watch form changes to update pending fields count
    this.appLinkForm.valueChanges.subscribe(() => {
      this.formValueChanged.update(v => v + 1);
    });

    // Watch brand changes to load products
    this.appLinkForm.get('brandId')?.valueChanges.subscribe((brandId) => {
      if (brandId) {
        this.loadProducts(brandId);
      }
    });

    // Watch product changes to update image
    this.appLinkForm.get('productCode')?.valueChanges.subscribe((productCode) => {
      if (productCode && !this.appLinkForm.get('useCustomImage')?.value) {
        const product = this.products().find(p => p.productCode === productCode);
        if (product) {
          this.appLinkForm.patchValue({ imageUrl: product.imageUrl });
        }
      }
    });

    // Watch useCustomImage toggle
    this.appLinkForm.get('useCustomImage')?.valueChanges.subscribe((useCustom) => {
      if (!useCustom) {
        const productCode = this.appLinkForm.get('productCode')?.value;
        const product = this.products().find(p => p.productCode === productCode);
        if (product) {
          this.appLinkForm.patchValue({ imageUrl: product.imageUrl });
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appLink'] && this.appLink()) {
      this.loadAppLinkData(this.appLink()!);
    }
  }

  /**
   * Asegura que los catálogos globales estén cargados
   * Si están vacíos, dispara la carga
   */
  private ensureGlobalDataLoaded(): void {
    if (this.brands().length === 0) {
      this.globalDataService.forceRefresh('brands');
    }
    if (this.channels().length === 0) {
      this.globalDataService.forceRefresh('channels');
    }
    if (this.cities().length === 0) {
      this.globalDataService.forceRefresh('citiesShort');
    }
  }

  private loadProducts(brandId: number): void {
    this.appLinkService.getProductsByBrand(brandId).subscribe({
      next: (products) => this.products.set(products),
      error: (error) => console.error('Error loading products:', error),
    });
  }

  private loadAppLinkData(appLink: DynamicLinkProduct): void {
    this.appLinkForm.patchValue({
      campaignName: appLink.campaignName || '',
      title: appLink.title,
      description: appLink.description,
      brandId: appLink.brandId,
      productCode: appLink.productCode || '',
      urlDynamicLink: appLink.deepLink,
      imageUrl: appLink.imageUrl,
      channelId: appLink.channelId,
      cityId: appLink.cityId,
      isActive: appLink.isActive,
      useCustomImage: false,
    });

    if (appLink.brandId) {
      this.loadProducts(appLink.brandId);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'La imagen no debe superar 5MB',
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Solo se permiten archivos de imagen',
        });
        return;
      }

      this.appLinkForm.patchValue({ customImageFile: file });

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.appLinkForm.patchValue({ imageUrl: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.appLinkForm.invalid) {
      this.appLinkForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor completa todos los campos requeridos',
      });
      return;
    }

    this.isLoading.set(true);

    const formValue = this.appLinkForm.getRawValue();

    // If using custom image, upload it first
    if (formValue.useCustomImage && formValue.customImageFile) {
      this.appLinkService
        .uploadImage(formValue.campaignName, formValue.customImageFile)
        .subscribe({
          next: (imageUrl) => {
            this.submitForm({ ...formValue, imageUrl });
          },
          error: (error) => {
            this.isLoading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al subir la imagen',
            });
            console.error('Error uploading image:', error);
          },
        });
    } else {
      this.submitForm(formValue);
    }
  }

  private submitForm(formValue: any): void {
    const requestData = {
      brandId: formValue.brandId!,
      productCode: formValue.productCode,
      urlDynamicLink: formValue.urlDynamicLink,
      descriptionLinkDynamic: formValue.description,
      titleLinkDynamic: formValue.title,
      pathImage: formValue.imageUrl,
      isActive: formValue.isActive,
      channelId: formValue.channelId,
      cityId: formValue.cityId,
      campaignName: formValue.campaignName,
    };

    const isEditMode = !!this.appLink();
    const request$ = isEditMode
      ? this.appLinkService.updateAppLink(this.appLink()!.dynamicLinkXProductId, requestData)
      : this.appLinkService.createAppLink(requestData);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: isEditMode
            ? 'App link actualizado exitosamente'
            : 'App link creado exitosamente',
        });
        this.isLoading.set(false);
        this.save.emit();
      },
      error: () => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: isEditMode
            ? 'Error al actualizar el app link'
            : 'Error al crear el app link',
        });
      },
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Custom Validators
  private noSpecialCharactersValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const validPattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\.,\-\(\)]+$/;
    return validPattern.test(control.value) ? null : { invalidCharacters: true };
  }
}
