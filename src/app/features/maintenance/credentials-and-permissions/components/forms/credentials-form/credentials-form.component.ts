import { Component, ChangeDetectionStrategy, signal, computed, inject, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { map } from 'rxjs/operators';
import { CredentialService } from '../../../services/credential.service';
import { RoleService } from '../../../services/role.service';
import { GlobalDataService } from '@core/services/global-data.service';
import { DataService } from '@core/services/data.service';
import { type City, type Country } from '@core/models/global-data.model';
import { type Credential, type CreateCredentialRequest, type UpdateCredentialRequest } from '../../../models';

/**
 * CredentialsFormComponent
 *
 * Drawer form for creating and editing user credentials
 * Features:
 * - CREATE/EDIT modes based on credential input
 * - Profile image upload with preview
 * - Password with visibility toggle
 * - Country and city selects with flags
 * - Role selection
 */
@Component({
  selector: 'app-credentials-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DrawerModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    PasswordModule,
    DividerModule
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './credentials-form.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CredentialsFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly credentialService = inject(CredentialService);
  private readonly roleService = inject(RoleService);
  private readonly globalData = inject(GlobalDataService);
  private readonly dataService = inject(DataService);
  private readonly messageService = inject(MessageService);

  // Inputs and outputs
  readonly credential = input<Credential | null>(null);
  readonly formClosed = output<boolean>();

  // State signals
  readonly loading = signal(false);
  readonly imagePreview = signal<string | null>(null);
  readonly imageFile = signal<File | null>(null);
  readonly countries = signal<Country[]>([]);
  readonly cities = signal<City[]>([]);
  readonly roles = signal<{ id: string; name: string }[]>([]);

  // Computed signals
  readonly isEditMode = computed(() => this.credential() !== null);
  readonly countryOptions = computed(() =>
    this.countries().map(c => ({
      label: c.name,
      value: c.id,
      flag: c.urlFlag
    }))
  );
  readonly cityOptions = computed(() =>
    this.cities().map(c => ({
      label: c.name,
      value: c.id,
      flag: c.countryUrlFlag,
      countryId: c.countryCode
    }))
  );
  readonly filteredCityOptions = computed(() => {
    const selectedCountry = this.form.controls.countryId.value;
    if (!selectedCountry) return [];
    return this.cityOptions().filter(c => c.countryId === selectedCountry);
  });
  readonly roleOptions = computed(() =>
    this.roles().map(r => ({
      label: r.name,
      value: r.id
    }))
  );

  // Drawer visibility
  visible = true;

  // Form with typed controls
  readonly form: FormGroup<{
    userName: FormControl<string>;
    userLastName: FormControl<string>;
    userEmail: FormControl<string>;
    userPhone: FormControl<string>;
    userAddress: FormControl<string>;
    userPassword: FormControl<string>;
    roleId: FormControl<string>;
    countryId: FormControl<number | null>;
    cityId: FormControl<number | null>;
  }>;

  // Original data for comparison in edit mode
  private originalData: Credential | null = null;

  constructor() {
    // Initialize form with validators
    this.form = this.fb.nonNullable.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      userLastName: [''],
      userEmail: ['', [Validators.required, Validators.email]],
      userPhone: [''],
      userAddress: [''],
      userPassword: ['', [Validators.required, Validators.minLength(8)]],
      roleId: ['', [Validators.required]],
      countryId: [null as number | null, [Validators.required]],
      cityId: [null as number | null, [Validators.required]]
    });

    // Load initial data
    this.loadCountries();
    this.loadCities();
    this.loadRoles();

    // Effect to load credential data when credential input changes
    effect(() => {
      const credentialData = this.credential();
      if (credentialData) {
        this.loadCredentialData(credentialData);
      } else {
        this.resetForm();
      }
    });
  }

  /**
   * Load countries from data service
   */
  private loadCountries(): void {
    const countriesList = this.globalData.countries();
    this.countries.set(countriesList || []);
  }

  /**
   * Load cities from data service
   */
  private loadCities(): void {
    const citiesList = this.globalData.cities();
    this.cities.set(citiesList || []);
  }

  /**
   * Load roles for dropdown
   */
  private loadRoles(): void {
    this.roleService.getRolesSummary().subscribe({
      next: (roles) => {
        this.roles.set(roles.map(r => ({ id: r.roleId, name: r.roleName })));
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los roles',
          life: 3000
        });
      }
    });
  }

  /**
   * Load credential data for edit mode
   */
  private loadCredentialData(credential: Credential): void {
    this.loading.set(true);
    this.originalData = credential;

    // Load full credential details
    this.credentialService.getCredentialById(credential.userId).subscribe({
      next: (credentialDetail) => {
        // Set form values
        this.form.patchValue({
          userName: credentialDetail.userName,
          userLastName: credentialDetail.userLastName,
          userEmail: credentialDetail.userEmail,
          userPhone: credentialDetail.userPhone,
          userAddress: credentialDetail.userAddress,
          userPassword: '', // Don't load password
          roleId: credentialDetail.roleId,
          countryId: credentialDetail.countryId,
          cityId: credentialDetail.cityId
        });

        // Make password optional in edit mode
        this.form.controls.userPassword.clearValidators();
        this.form.controls.userPassword.updateValueAndValidity();

        // Set image preview
        if (credentialDetail.userImage) {
          this.imagePreview.set(credentialDetail.userImage);
        }

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading credential data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los datos del usuario',
          life: 3000
        });
        this.loading.set(false);
      }
    });
  }

  /**
   * Get country ID from city ID
   */
  private getCityCountryId(cityId: number): number | null {
    const city = this.cities().find(c => c.id === cityId);
    return city ? city.countryCode : null;
  }

  /**
   * Handle country change
   */
  onCountryChange(event: any): void {
    // Reset city when country changes
    this.form.controls.cityId.setValue(null);
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      // Validate file type
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Solo se permiten imágenes PNG, JPG o JPEG',
          life: 3000
        });
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'La imagen no debe superar los 2MB',
          life: 3000
        });
        return;
      }

      // Read file for preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview.set(e.target.result);
      };
      reader.readAsDataURL(file);

      this.imageFile.set(file);
    }
  }

  /**
   * Remove selected image
   */
  removeImage(): void {
    this.imagePreview.set(null);
    this.imageFile.set(null);
  }

  /**
   * Handle form submission
   */
  handleSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const formValue = this.form.getRawValue();

    if (this.isEditMode()) {
      // Update existing credential
      this.updateCredential(formValue);
    } else {
      // Create new credential
      this.createCredential(formValue);
    }
  }

  /**
   * Create new credential
   */
  private createCredential(formValue: any): void {
    const imageFile = this.imageFile();

    // Upload image if present
    if (imageFile) {
      const fileName = `${Date.now()}.png`;
      this.uploadImage(fileName, imageFile).subscribe({
        next: (imageUrl) => {
          this.saveNewCredential(formValue, imageUrl);
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          // Continue without image
          this.saveNewCredential(formValue, null);
        }
      });
    } else {
      this.saveNewCredential(formValue, null);
    }
  }

  /**
   * Save new credential with image URL
   */
  private saveNewCredential(formValue: any, imageUrl: string | null): void {
    const request: CreateCredentialRequest = {
      userName: formValue.userName,
      userLastName: formValue.userLastName,
      userEmail: formValue.userEmail,
      userPhone: formValue.userPhone,
      userAddress: formValue.userAddress,
      userPassword: formValue.userPassword,
      roleId: formValue.roleId,
      countryId: formValue.countryId!,
      cityId: formValue.cityId!,
      userImageKey: imageUrl
    };

    this.credentialService.createCredential(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Credencial creada exitosamente',
          life: 3000
        });
        this.loading.set(false);
        this.formClosed.emit(true);
      },
      error: (error) => {
        console.error('Error creating credential:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al crear la credencial',
          life: 3000
        });
        this.loading.set(false);
      }
    });
  }

  /**
   * Update existing credential
   */
  private updateCredential(formValue: any): void {
    if (!this.originalData) return;

    const imageFile = this.imageFile();

    // Upload new image if changed
    if (imageFile) {
      const fileName = `${this.originalData.userId}.png`;
      this.uploadImage(fileName, imageFile).subscribe({
        next: (imageUrl) => {
          this.saveUpdatedCredential(formValue, imageUrl);
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          // Continue without updating image
          this.saveUpdatedCredential(formValue, undefined);
        }
      });
    } else {
      this.saveUpdatedCredential(formValue, undefined);
    }
  }

  /**
   * Save updated credential
   */
  private saveUpdatedCredential(formValue: any, imageUrl?: string): void {
    if (!this.originalData) return;

    const request: UpdateCredentialRequest = {
      userName: formValue.userName,
      userLastName: formValue.userLastName,
      userEmail: formValue.userEmail,
      userPhone: formValue.userPhone,
      userAddress: formValue.userAddress,
      userPassword: formValue.userPassword || undefined,
      roleId: formValue.roleId,
      countryId: formValue.countryId!,
      cityId: formValue.cityId!,
      userImageKey: imageUrl
    };

    this.credentialService.updateCredential(this.originalData.userId, request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Credencial actualizada exitosamente',
          life: 3000
        });
        this.loading.set(false);
        this.formClosed.emit(true);
      },
      error: (error) => {
        console.error('Error updating credential:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar la credencial',
          life: 3000
        });
        this.loading.set(false);
      }
    });
  }

  /**
   * Upload image to storage
   */
  private uploadImage(fileName: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);

    return this.dataService.post$<{ url: string }>('Storage/upload', formData).pipe(
      map((response: any) => response.url)
    );
  }

  /**
   * Reset form to initial state
   */
  private resetForm(): void {
    this.form.reset();
    this.imagePreview.set(null);
    this.imageFile.set(null);
    this.originalData = null;

    // Restore password validators for create mode
    this.form.controls.userPassword.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.controls.userPassword.updateValueAndValidity();
  }

  /**
   * Handle drawer close
   */
  handleClose(): void {
    this.resetForm();
    this.formClosed.emit(false);
  }
}
