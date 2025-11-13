import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
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
import { DataService } from '@core/services/data.service';
import { AppLinkService } from '../../services';
import { AppLinkPreviewComponent } from '../../components';
import { ProductData } from '../../models';

interface Brand {
  brandId: number;
  name: string;
  logoBrand: string;
}

interface Channel {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
}

@Component({
  selector: 'app-app-link-detail-page',
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
  templateUrl: './app-link-detail-page.component.html',
  styleUrls: ['./app-link-detail-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLinkDetailPageComponent implements OnInit {
  private readonly appLinkService = inject(AppLinkService);
  private readonly dataService = inject(DataService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  readonly isEditMode = signal(false);
  readonly isLoading = signal(false);
  readonly appLinkId = signal<number | null>(null);

  readonly brands = signal<Brand[]>([]);
  readonly products = signal<ProductData[]>([]);
  readonly channels = signal<Channel[]>([]);
  readonly cities = signal<City[]>([]);

  readonly appLinkForm = this.fb.nonNullable.group({
    campaignName: ['', [Validators.required, Validators.maxLength(100)]],
    title: ['', [Validators.required, Validators.maxLength(60), this.noSpecialCharactersValidator]],
    description: ['', [Validators.required, Validators.maxLength(200)]],
    brandId: [0 as number | null, Validators.required],
    productCode: ['', Validators.required],
    urlDynamicLink: ['', [Validators.required, this.urlValidator]],
    imageUrl: ['', Validators.required],
    useCustomImage: [false],
    customImageFile: [null as File | null],
    channelId: [null as number | null],
    cityId: [null as number | null],
    isActive: [true],
  });

  ngOnInit(): void {
    this.loadBrands();
    this.loadChannels();
    this.loadCities();

    const id = this.route.snapshot.paramMap.get('campaignName');
    if (id) {
      this.isEditMode.set(true);
      this.loadAppLink(+id);
    }

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

  private loadBrands(): void {
    this.dataService.get$<Brand[]>('Brand/BrandsListSorted').subscribe({
      next: (brands) => this.brands.set(brands),
      error: (error) => console.error('Error loading brands:', error),
    });
  }

  private loadChannels(): void {
    this.dataService.get$<Channel[]>('Channels').subscribe({
      next: (channels) => this.channels.set(channels),
      error: (error) => console.error('Error loading channels:', error),
    });
  }

  private loadCities(): void {
    this.dataService.get$<City[]>('Cities').subscribe({
      next: (cities) => this.cities.set(cities),
      error: (error) => console.error('Error loading cities:', error),
    });
  }

  private loadProducts(brandId: number): void {
    this.appLinkService.getProductsByBrand(brandId).subscribe({
      next: (products) => this.products.set(products),
      error: (error) => console.error('Error loading products:', error),
    });
  }

  private loadAppLink(id: number): void {
    this.isLoading.set(true);
    this.appLinkService.getAppLinkById(id).subscribe({
      next: (appLink) => {
        this.appLinkId.set(appLink.dynamicLinkXProductId);
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

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Error al cargar el app link ${id}`,
        });
        this.router.navigate(['/notification-managements/app-link']);
      },
    });
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

    const request$ = this.isEditMode()
      ? this.appLinkService.updateAppLink(this.appLinkId()!, requestData)
      : this.appLinkService.createAppLink(requestData);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.isEditMode()
            ? 'App link actualizado exitosamente'
            : 'App link creado exitosamente',
        });
        this.router.navigate(['/notification-managements/app-link']);
      },
      error: () => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.isEditMode()
            ? 'Error al actualizar el app link'
            : 'Error al crear el app link',
        });
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/notification-managements/app-link']);
  }

  // Custom Validators
  private urlValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    try {
      const url = new URL(control.value);
      return url.protocol === 'http:' || url.protocol === 'https:'
        ? null
        : { invalidUrl: true };
    } catch {
      return { invalidUrl: true };
    }
  }

  private noSpecialCharactersValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const validPattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\.,\-\(\)]+$/;
    return validPattern.test(control.value) ? null : { invalidCharacters: true };
  }
}
