import { Component, ChangeDetectionStrategy, signal, input, output, inject, OnInit, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';

import { ChannelService } from '../../services/channel.service';
import { Channel, Brand, ChannelPayload } from '../../models/channel.model';

/**
 * ChannelFormComponent
 *
 * Modal form para crear/editar canales
 * - Upload de icono a S3
 * - Selección múltiple de marcas
 * - Validaciones
 */
@Component({
  selector: 'app-channel-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DrawerModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    SelectModule,
    ToggleSwitchModule,
    CheckboxModule,
    FileUploadModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './channel-form.component.html'
})
export class ChannelFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly channelService = inject(ChannelService);
  private readonly messageService = inject(MessageService);

  // Inputs
  readonly visible = input.required<boolean>();
  readonly channelId = input<number | null>(null);

  // Outputs
  readonly visibleChange = output<boolean>();
  readonly onSave = output<void>();

  // Local state
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly uploadingIcon = signal(false);
  readonly previewUrl = signal<string | null>(null);
  readonly brands = signal<Brand[]>([]);
  visibleModel = false;

  // Form
  channelForm!: FormGroup;

  constructor() {
    this.initForm();

    // Watch for visible and channelId changes with effect
    effect(() => {
      const isVisible = this.visible();
      const id = this.channelId();

      console.log('🔍 [ChannelForm Effect] visible:', isVisible, 'channelId:', id);

      // Use untracked to prevent infinite loops
      untracked(() => {
        this.visibleModel = isVisible;
        console.log('📝 [ChannelForm Effect] visibleModel set to:', this.visibleModel);

        if (isVisible) {
          if (id) {
            console.log('✏️ [ChannelForm Effect] Loading channel data for ID:', id);
            this.loadChannelData(id);
          } else {
            console.log('➕ [ChannelForm Effect] Resetting form for new channel');
            this.resetForm();
          }
        }
      });
    });
  }

  ngOnInit(): void {
    this.loadBrands();
  }

  /**
   * Handle visible change from drawer
   */
  onVisibleChange(visible: boolean): void {
    console.log('🚪 [ChannelForm onVisibleChange] visible:', visible);
    this.visibleModel = visible;
    this.visibleChange.emit(visible);
  }

  /**
   * Initialize form
   */
  private initForm(): void {
    this.channelForm = this.fb.group({
      channelName: ['', [Validators.required, Validators.maxLength(100)]],
      fullNameTypeChannel: [''],
      typeChannel: ['', Validators.required],
      descTypeChannel: ['', Validators.maxLength(200)],
      instructionsChannel: ['', Validators.maxLength(500)],
      isActiveChannel: [true],
      isVisibleChannel: [true],
      iconUrlChannel: [''],
      brandsList: [[]]
    });
  }

  /**
   * Load brands list
   */
  private loadBrands(): void {
    this.channelService.getBrandsList().subscribe({
      next: (brands) => {
        this.brands.set(brands.map(b => ({ ...b, isSelected: false })));
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las marcas'
        });
        console.error('Error loading brands:', error);
      }
    });
  }

  /**
   * Load channel data for editing
   */
  private loadChannelData(channelId: number): void {
    console.log('📥 [ChannelForm loadChannelData] Loading channel ID:', channelId);
    this.isLoading.set(true);

    this.channelService.getChannelDetail(channelId).subscribe({
      next: (channel) => {
        console.log('✅ [ChannelForm loadChannelData] Channel loaded:', channel);
        this.patchFormWithChannel(channel);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ [ChannelForm loadChannelData] Error loading channel:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el canal'
        });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Patch form with channel data
   */
  private patchFormWithChannel(channel: Channel): void {
    console.log('📝 [ChannelForm patchFormWithChannel] Channel data received:', channel);

    this.channelForm.patchValue({
      channelName: channel.descriptionChannel,
      fullNameTypeChannel: channel.fullNameTypeChannel || '',
      typeChannel: channel.typeChannel,
      descTypeChannel: channel.descTypeChannel || '',
      instructionsChannel: channel.instructionsChannel,
      isActiveChannel: channel.isActiveChannel,
      isVisibleChannel: channel.isVisibleChannel,
      iconUrlChannel: channel.iconUrlChannel
    });

    console.log('📝 [ChannelForm patchFormWithChannel] Form values after patch:', this.channelForm.value);

    // Set preview URL
    if (channel.iconUrlChannel) {
      this.previewUrl.set(channel.iconUrlChannel);
    }

    // Update brands selection - map from API response
    const currentBrands = this.brands();
    if (currentBrands.length > 0 && channel.brandsList && Array.isArray(channel.brandsList)) {
      // Create a Set of selected brand IDs from the channel's brandsList
      const selectedBrandIds = new Set(channel.brandsList.map(b => b.idBrand));

      // Map current brands to include isSelected based on whether they're in the channel
      const updatedBrands = currentBrands.map(brand => ({
        ...brand,
        isSelected: selectedBrandIds.has(brand.idBrand)
      }));

      this.brands.set(updatedBrands);
      console.log('📝 [ChannelForm patchFormWithChannel] Updated brands:', updatedBrands);
    }
  }

  /**
   * Reset form
   */
  private resetForm(): void {
    this.channelForm.reset({
      channelName: '',
      fullNameTypeChannel: '',
      typeChannel: '',
      descTypeChannel: '',
      instructionsChannel: '',
      isActiveChannel: true,
      isVisibleChannel: true,
      iconUrlChannel: '',
      brandsList: []
    });
    this.previewUrl.set(null);

    // Reset brands selection only if brands exist
    const currentBrands = this.brands();
    if (currentBrands.length > 0) {
      const resetBrands = currentBrands.map(b => ({ ...b, isSelected: false }));
      this.brands.set(resetBrands);
    }
  }

  /**
   * Handle file selection - Upload immediately to S3
   */
  onFileSelect(event: any): void {
    const file = event.files?.[0] || event.currentFiles?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor selecciona un archivo de imagen'
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El archivo es demasiado grande. Máximo 2MB'
      });
      return;
    }

    // Create preview first
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl.set(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to S3 immediately
    this.uploadingIcon.set(true);
    this.channelService.uploadIcon(file).subscribe({
      next: (iconUrl) => {
        console.log('✅ [ChannelForm onFileSelect] Image uploaded successfully:', iconUrl);
        // Set the URL in the form
        this.channelForm.patchValue({ iconUrlChannel: iconUrl });
        this.uploadingIcon.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Imagen subida correctamente'
        });
      },
      error: (error) => {
        console.error('❌ [ChannelForm onFileSelect] Error uploading image:', error);
        this.uploadingIcon.set(false);
        this.previewUrl.set(null);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo subir la imagen'
        });
      }
    });
  }

  /**
   * Toggle brand selection
   */
  toggleBrand(brandId: number): void {
    const updatedBrands = this.brands().map(brand =>
      brand.idBrand === brandId
        ? { ...brand, isSelected: !brand.isSelected }
        : brand
    );
    this.brands.set(updatedBrands);
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.channelForm.invalid) {
      this.channelForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor completa todos los campos requeridos'
      });
      return;
    }

    this.isSaving.set(true);

    // Prepare payload with correct API field names
    // Note: iconUrlChannel is already set in the form when image is uploaded in onFileSelect
    const payload: ChannelPayload = {
      channelName: this.channelForm.value.channelName,
      fullNameTypeChannel: this.channelForm.value.fullNameTypeChannel,
      descTypeChannel: this.channelForm.value.descTypeChannel,
      instructionChannel: this.channelForm.value.instructionsChannel,
      typeChannel: this.channelForm.value.typeChannel,
      isActive: this.channelForm.value.isActiveChannel,
      isVisible: this.channelForm.value.isVisibleChannel,
      codBrands: this.brands()
        .filter(b => b.isSelected)
        .map(b => b.idBrand)
    };

    console.log('📤 [ChannelForm onSubmit] Payload:', payload);

    // Create or update
    const operation = this.channelId()
      ? this.channelService.updateChannel(this.channelId()!, payload)
      : this.channelService.createChannel(payload);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Canal ${this.channelId() ? 'actualizado' : 'creado'} correctamente`
        });
        this.isSaving.set(false);
        this.closeDrawer();
        this.onSave.emit();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo ${this.channelId() ? 'actualizar' : 'crear'} el canal`
        });
        console.error('❌ [ChannelForm onSubmit] Error saving channel:', error);
        this.isSaving.set(false);
      }
    });
  }


  /**
   * Close drawer
   */
  closeDrawer(): void {
    this.visibleModel = false;
    this.visibleChange.emit(false);
    this.resetForm();
  }

  /**
   * Get form control
   */
  getControl(name: string) {
    return this.channelForm.get(name);
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const control = this.getControl(fieldName);
    return !!(control?.hasError(errorType) && (control?.dirty || control?.touched));
  }
}
