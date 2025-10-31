import {
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';

import type { QuickScheduleConfig } from '../../../../models/schedule.model';
import { DAYS_OF_WEEK as DAYS, CHANNEL_INFO as CHANNELS } from '../../../../models/schedule.model';

@Component({
  selector: 'app-quick-schedule-drawer',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DrawerModule,
    ButtonModule,
    DatePickerModule,
    CheckboxModule
  ],
  templateUrl: './quick-schedule-drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickScheduleDrawerComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  // Inputs
  readonly visible = input.required<boolean>();
  readonly availableChannels = input.required<number[]>();

  // Outputs
  readonly onClose = output<void>();
  readonly onApply = output<QuickScheduleConfig>();

  // Constants
  readonly DAYS = DAYS;
  readonly CHANNELS = CHANNELS;

  // Form
  form!: FormGroup;

  // Validation signals
  readonly hasTimeError = signal<boolean>(false);
  readonly hasDaysError = signal<boolean>(false);
  readonly hasChannelsError = signal<boolean>(false);
  readonly timeErrorMessage = signal<string>('');

  // Computed: Check if form is valid
  readonly canSubmit = computed(() => {
    return !this.hasTimeError() && !this.hasDaysError() && !this.hasChannelsError();
  });

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initialize form
   */
  private initForm(): void {
    this.form = this.fb.group({
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      selectedDays: this.fb.array(
        DAYS.map(() => this.fb.control(false))
      )
    });

    // Add dynamic channel controls
    this.availableChannels().forEach(channelId => {
      this.form.addControl(`channel_${channelId}`, this.fb.control(false));
    });

    // Listen to form changes for validation
    this.form.valueChanges.subscribe(() => {
      this.validateForm();
    });
  }

  /**
   * Get selected days array
   */
  getSelectedDaysArray(): FormArray {
    return this.form.get('selectedDays') as FormArray;
  }

  /**
   * Validate entire form
   */
  private validateForm(): void {
    this.validateTimes();
    this.validateDays();
    this.validateChannels();
  }

  /**
   * Validate time selection
   */
  private validateTimes(): void {
    const startTime = this.form.get('startTime')?.value;
    const endTime = this.form.get('endTime')?.value;

    if (!startTime || !endTime) {
      this.hasTimeError.set(true);
      this.timeErrorMessage.set('Debe seleccionar hora de inicio y fin');
      return;
    }

    // Compare times
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

    if (endMinutes <= startMinutes) {
      this.hasTimeError.set(true);
      this.timeErrorMessage.set('La hora de fin debe ser mayor que la hora de inicio');
      return;
    }

    this.hasTimeError.set(false);
    this.timeErrorMessage.set('');
  }

  /**
   * Validate at least one day selected
   */
  private validateDays(): void {
    const selectedDays = this.getSelectedDaysArray();
    const hasSelection = selectedDays.controls.some(control => control.value === true);
    this.hasDaysError.set(!hasSelection);
  }

  /**
   * Validate at least one channel selected
   */
  private validateChannels(): void {
    const hasSelection = this.availableChannels().some(channelId => {
      return this.form.get(`channel_${channelId}`)?.value === true;
    });
    this.hasChannelsError.set(!hasSelection);
  }

  /**
   * Select weekdays (Monday-Friday)
   */
  selectWeekdays(): void {
    const daysArray = this.getSelectedDaysArray();
    // Monday=1 to Friday=5
    for (let i = 1; i <= 5; i++) {
      daysArray.at(i).setValue(true);
    }
    this.validateDays();
  }

  /**
   * Select weekend (Saturday-Sunday)
   */
  selectWeekend(): void {
    const daysArray = this.getSelectedDaysArray();
    daysArray.at(0).setValue(true); // Sunday
    daysArray.at(6).setValue(true); // Saturday
    this.validateDays();
  }

  /**
   * Select all days
   */
  selectAllDays(): void {
    const daysArray = this.getSelectedDaysArray();
    daysArray.controls.forEach(control => control.setValue(true));
    this.validateDays();
  }

  /**
   * Clear all days
   */
  clearAllDays(): void {
    const daysArray = this.getSelectedDaysArray();
    daysArray.controls.forEach(control => control.setValue(false));
    this.validateDays();
  }

  /**
   * Select all channels
   */
  selectAllChannels(): void {
    this.availableChannels().forEach(channelId => {
      this.form.get(`channel_${channelId}`)?.setValue(true);
    });
    this.validateChannels();
  }

  /**
   * Clear all channels
   */
  clearAllChannels(): void {
    this.availableChannels().forEach(channelId => {
      this.form.get(`channel_${channelId}`)?.setValue(false);
    });
    this.validateChannels();
  }

  /**
   * Format Date to "HH:MM" string
   */
  private formatTimeToString(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    this.validateForm();

    if (!this.canSubmit()) {
      return;
    }

    const startTime = this.form.get('startTime')?.value;
    const endTime = this.form.get('endTime')?.value;
    const daysArray = this.getSelectedDaysArray();

    // Get selected day IDs
    const selectedDays: number[] = [];
    daysArray.controls.forEach((control, index) => {
      if (control.value === true) {
        selectedDays.push(index);
      }
    });

    // Get selected channel IDs
    const selectedChannels: number[] = [];
    this.availableChannels().forEach(channelId => {
      if (this.form.get(`channel_${channelId}`)?.value === true) {
        selectedChannels.push(channelId);
      }
    });

    const config: QuickScheduleConfig = {
      startTime: this.formatTimeToString(startTime),
      endTime: this.formatTimeToString(endTime),
      selectedDays,
      selectedChannels
    };

    this.onApply.emit(config);
    this.resetForm();
  }

  /**
   * Reset form to initial state
   */
  private resetForm(): void {
    this.form.reset();
    const daysArray = this.getSelectedDaysArray();
    daysArray.controls.forEach(control => control.setValue(false));
    this.availableChannels().forEach(channelId => {
      this.form.get(`channel_${channelId}`)?.setValue(false);
    });
    this.hasTimeError.set(false);
    this.hasDaysError.set(false);
    this.hasChannelsError.set(false);
  }

  /**
   * Handle drawer close
   */
  handleClose(): void {
    this.resetForm();
    this.onClose.emit();
  }
}
