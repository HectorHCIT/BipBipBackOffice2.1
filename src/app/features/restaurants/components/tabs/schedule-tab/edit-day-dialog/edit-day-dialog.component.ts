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
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-edit-day-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    DatePickerModule
  ],
  templateUrl: './edit-day-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditDayDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  // Inputs
  readonly visible = input.required<boolean>();
  readonly dayName = input.required<string>();
  readonly channelName = input.required<string>();
  readonly startTime = input<Date | null>(null);
  readonly endTime = input<Date | null>(null);

  // Outputs
  readonly onClose = output<void>();
  readonly onSave = output<{ startTime: Date, endTime: Date }>();

  // Form
  form!: FormGroup;

  // Validation
  readonly hasError = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  ngOnInit(): void {
    this.initForm();
    this.loadTimes();
  }

  /**
   * Initialize form
   */
  private initForm(): void {
    this.form = this.fb.group({
      startTime: [null, Validators.required],
      endTime: [null, Validators.required]
    });

    // Listen to changes for validation
    this.form.valueChanges.subscribe(() => {
      this.validateTimes();
    });
  }

  /**
   * Load times into form
   */
  private loadTimes(): void {
    const start = this.startTime();
    const end = this.endTime();

    if (start && end) {
      this.form.patchValue({
        startTime: start,
        endTime: end
      });
    }
  }

  /**
   * Validate times
   */
  private validateTimes(): void {
    const startTime = this.form.get('startTime')?.value;
    const endTime = this.form.get('endTime')?.value;

    if (!startTime || !endTime) {
      this.hasError.set(true);
      this.errorMessage.set('Debe seleccionar hora de inicio y fin');
      return;
    }

    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

    if (endMinutes <= startMinutes) {
      this.hasError.set(true);
      this.errorMessage.set('La hora de fin debe ser mayor que la hora de inicio');
      return;
    }

    this.hasError.set(false);
    this.errorMessage.set('');
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.form.invalid || this.hasError()) {
      return;
    }

    const startTime = this.form.get('startTime')?.value;
    const endTime = this.form.get('endTime')?.value;

    this.onSave.emit({ startTime, endTime });
  }

  /**
   * Handle dialog close
   */
  handleClose(): void {
    this.form.reset();
    this.hasError.set(false);
    this.errorMessage.set('');
    this.onClose.emit();
  }
}
