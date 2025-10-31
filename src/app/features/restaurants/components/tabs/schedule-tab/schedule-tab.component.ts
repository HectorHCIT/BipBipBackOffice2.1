import {
  Component,
  OnInit,
  inject,
  input,
  signal,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DrawerModule } from 'primeng/drawer';
import { MessageService } from 'primeng/api';

import { RestaurantService } from '../../../services/restaurant.service';
import { QuickScheduleDrawerComponent } from './quick-schedule-drawer/quick-schedule-drawer.component';
import { EditDayDialogComponent } from './edit-day-dialog/edit-day-dialog.component';
import type {
  RESTSchedule,
  Schedule,
  UpdateSchedule,
  ScheduleTime,
  QuickScheduleConfig,
  DAYS_OF_WEEK,
  CHANNEL_INFO
} from '../../../models/schedule.model';
import { DAYS_OF_WEEK as DAYS, CHANNEL_INFO as CHANNELS, SCHEDULE_CHANNELS } from '../../../models/schedule.model';

@Component({
  selector: 'app-schedule-tab',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    TableModule,
    CheckboxModule,
    DatePickerModule,
    DrawerModule,
    QuickScheduleDrawerComponent,
    EditDayDialogComponent
  ],
  templateUrl: './schedule-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduleTabComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly restaurantService = inject(RestaurantService);
  private readonly messageService = inject(MessageService);

  // Input
  readonly restaurantId = input.required<number>();

  // Constants
  readonly DAYS = DAYS;
  readonly CHANNELS = CHANNELS;
  readonly ALLOWED_CHANNEL_IDS = [SCHEDULE_CHANNELS.DELIVERY, SCHEDULE_CHANNELS.TAKEOUT, SCHEDULE_CHANNELS.RESTAURANT];

  // State
  readonly isSaving = signal<boolean>(false);
  readonly showQuickSchedule = signal<boolean>(false);
  readonly showEditDialog = signal<boolean>(false);
  readonly editingChannelIndex = signal<number>(-1);
  readonly editingDayIndex = signal<number>(-1);

  // Form
  form!: FormGroup;

  // Computed: Get schedules from service
  readonly schedules = computed(() => {
    const detail = this.restaurantService.restaurantDetail();
    return detail?.restSchedules || [];
  });

  // Computed: Check if has any configured schedule
  readonly hasSchedules = computed(() => {
    return this.schedules().some((channel: RESTSchedule) =>
      channel.schedules.some((schedule: Schedule) => schedule.active)
    );
  });

  ngOnInit(): void {
    this.initForm();
    this.loadRestaurantDetail();
  }

  /**
   * Load restaurant detail to get schedules
   */
  private loadRestaurantDetail(): void {
    const restId = this.restaurantId();
    this.restaurantService.getRestaurantDetail(restId).subscribe({
      next: () => {
        this.loadSchedules();
      },
      error: (error) => {
        console.error('Error loading restaurant detail:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la información del restaurante'
        });
        // Even if error, initialize empty channels so UI renders
        this.loadSchedules();
      }
    });
  }

  /**
   * Initialize form structure with empty channels
   */
  private initForm(): void {
    const channelsArray = this.fb.array(
      this.ALLOWED_CHANNEL_IDS.map(channelId => this.createChannelFormGroup(channelId, undefined))
    );

    this.form = this.fb.group({
      channels: channelsArray
    });
  }

  /**
   * Load schedules and populate form
   */
  loadSchedules(): void {
    const scheduleData = this.schedules();
    const channelsArray = this.form.get('channels') as FormArray;

    // Update existing channels instead of clearing and recreating
    this.ALLOWED_CHANNEL_IDS.forEach((channelId, index) => {
      const channelData = scheduleData.find((ch: RESTSchedule) => ch.channelId === channelId);

      if (channelsArray.at(index)) {
        // Update existing channel
        this.updateChannelFormGroup(index, channelId, channelData);
      } else {
        // Create new channel if it doesn't exist (shouldn't happen with pre-populated form)
        channelsArray.push(this.createChannelFormGroup(channelId, channelData));
      }
    });
  }

  /**
   * Update an existing channel form group with data
   */
  private updateChannelFormGroup(channelIndex: number, channelId: number, channelData?: RESTSchedule): void {
    const channelGroup = this.getChannelGroup(channelIndex);
    const daysArray = this.getDaysArray(channelIndex);

    // Update channel fields
    channelGroup.patchValue({
      channelId: channelId,
      channel: CHANNELS[channelId]?.name || '',
      active: this.isChannelActive(channelData)
    });

    // Update each day
    DAYS.forEach((day, dayIndex) => {
      const daySchedule = channelData?.schedules.find(s => s.schedulesDaysId === day.id);
      const isActive = daySchedule?.active || false;

      const dayGroup = daysArray.at(dayIndex) as FormGroup;
      dayGroup.patchValue({
        id: day.id,
        day: day.name,
        active: isActive,
        hourInit: isActive && daySchedule ? this.parseTimeToDate(daySchedule.shedulesStartTime) : null,
        hourEnd: isActive && daySchedule ? this.parseTimeToDate(daySchedule.shedulesEndTime) : null
      });
    });
  }

  /**
   * Create form group for a channel
   */
  private createChannelFormGroup(channelId: number, channelData?: RESTSchedule): FormGroup {
    const daysArray = this.fb.array(
      DAYS.map(day => this.createDayFormGroup(day.id, channelData))
    );

    const channelGroup = this.fb.group({
      channelId: [channelId],
      channel: [CHANNELS[channelId]?.name || ''],
      days: daysArray,
      active: [this.isChannelActive(channelData)]
    });

    return channelGroup;
  }

  /**
   * Create form group for a day
   */
  private createDayFormGroup(dayId: number, channelData?: RESTSchedule): FormGroup {
    const daySchedule = channelData?.schedules.find(s => s.schedulesDaysId === dayId);
    const isActive = daySchedule?.active || false;

    return this.fb.group({
      id: [dayId],
      day: [DAYS[dayId].name],
      active: [isActive],
      hourInit: [isActive && daySchedule ? this.parseTimeToDate(daySchedule.shedulesStartTime) : null],
      hourEnd: [isActive && daySchedule ? this.parseTimeToDate(daySchedule.shedulesEndTime) : null]
    });
  }

  /**
   * Check if channel has any active schedule
   */
  private isChannelActive(channelData?: RESTSchedule): boolean {
    if (!channelData) return false;
    return channelData.schedules.some(schedule => schedule.active);
  }

  /**
   * Parse time string "HH:MM:SS" to Date object for Calendar component
   */
  private parseTimeToDate(timeString: string): Date | null {
    if (!timeString || timeString === '00:00:00') return null;

    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(0);

    return date;
  }

  /**
   * Format Date object to time string "HH:MM:SS"
   */
  private formatDateToTime(date: Date | null): string {
    if (!date) return '00:00:00';

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}:00`;
  }

  /**
   * Get channels form array
   */
  getChannelsArray(): FormArray {
    return this.form.get('channels') as FormArray;
  }

  /**
   * Get days array for a channel
   */
  getDaysArray(channelIndex: number): FormArray {
    return this.getChannelsArray().at(channelIndex).get('days') as FormArray;
  }

  /**
   * Get channel form group
   */
  getChannelGroup(channelIndex: number): FormGroup {
    return this.getChannelsArray().at(channelIndex) as FormGroup;
  }

  /**
   * Get day form group
   */
  getDayGroup(channelIndex: number, dayIndex: number): FormGroup {
    return this.getDaysArray(channelIndex).at(dayIndex) as FormGroup;
  }

  /**
   * Toggle entire channel on/off
   */
  toggleChannelActive(channelIndex: number): void {
    const channelGroup = this.getChannelGroup(channelIndex);
    const isActive = channelGroup.get('active')?.value;
    const daysArray = this.getDaysArray(channelIndex);

    daysArray.controls.forEach(dayControl => {
      dayControl.get('active')?.setValue(!isActive);
      if (isActive) {
        // Deactivating: clear times
        dayControl.get('hourInit')?.setValue(null);
        dayControl.get('hourEnd')?.setValue(null);
      }
    });

    channelGroup.get('active')?.setValue(!isActive);
  }

  /**
   * Toggle day active status
   */
  toggleDayActive(channelIndex: number, dayIndex: number): void {
    const dayGroup = this.getDayGroup(channelIndex, dayIndex);
    const isActive = dayGroup.get('active')?.value;

    if (isActive) {
      // Deactivating: clear times
      dayGroup.get('hourInit')?.setValue(null);
      dayGroup.get('hourEnd')?.setValue(null);
    }

    dayGroup.get('active')?.setValue(!isActive);

    // Update channel active status
    this.updateChannelActiveStatus(channelIndex);
  }

  /**
   * Update channel active status based on days
   */
  private updateChannelActiveStatus(channelIndex: number): void {
    const channelGroup = this.getChannelGroup(channelIndex);
    const daysArray = this.getDaysArray(channelIndex);

    const hasAnyActiveDay = daysArray.controls.some(
      dayControl => dayControl.get('active')?.value === true
    );

    channelGroup.get('active')?.setValue(hasAnyActiveDay);
  }

  /**
   * Get count of active days for a channel
   */
  getActiveDaysCount(channelIndex: number): number {
    const daysArray = this.getDaysArray(channelIndex);
    return daysArray.controls.filter(
      dayControl => dayControl.get('active')?.value === true
    ).length;
  }

  /**
   * Calculate duration between two times
   */
  getScheduleDuration(startTime: Date | null, endTime: Date | null): string {
    if (!startTime || !endTime) return '—';

    let start = startTime.getHours() * 60 + startTime.getMinutes();
    let end = endTime.getHours() * 60 + endTime.getMinutes();

    // Handle overnight schedules
    if (end < start) {
      end += 24 * 60; // Add 24 hours
    }

    const totalMinutes = end - start;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Open quick schedule drawer
   */
  openQuickSchedule(): void {
    this.showQuickSchedule.set(true);
  }

  /**
   * Close quick schedule drawer
   */
  closeQuickSchedule(): void {
    this.showQuickSchedule.set(false);
  }

  /**
   * Handle quick schedule applied
   */
  onQuickScheduleApplied(config: QuickScheduleConfig): void {
    const startDate = this.parseTimeToDate(`${config.startTime}:00`);
    const endDate = this.parseTimeToDate(`${config.endTime}:00`);

    config.selectedChannels.forEach(channelId => {
      // Find channel index - indexOf works with number[]
      const channelIndex = (this.ALLOWED_CHANNEL_IDS as number[]).indexOf(channelId);
      if (channelIndex === -1) return;

      const daysArray = this.getDaysArray(channelIndex);

      config.selectedDays.forEach(dayId => {
        const dayControl = daysArray.at(dayId) as FormGroup;
        dayControl.get('active')?.setValue(true);
        dayControl.get('hourInit')?.setValue(startDate);
        dayControl.get('hourEnd')?.setValue(endDate);
      });

      // Update channel active status
      this.updateChannelActiveStatus(channelIndex);
    });

    this.closeQuickSchedule();

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Horarios aplicados correctamente'
    });
  }

  /**
   * Save schedules
   */
  onSubmit(): void {
    const channelsArray = this.getChannelsArray();
    const updatePayload: UpdateSchedule[] = [];

    channelsArray.controls.forEach((channelControl) => {
      const channelGroup = channelControl as FormGroup;
      const channelId = channelGroup.get('channelId')?.value;
      const isActive = channelGroup.get('active')?.value;
      const daysArray = channelGroup.get('days') as FormArray;

      const schedules: ScheduleTime[] = [];

      daysArray.controls.forEach((dayControl) => {
        const dayGroup = dayControl as FormGroup;
        const dayActive = dayGroup.get('active')?.value;

        if (dayActive) {
          const dayId = dayGroup.get('id')?.value;
          const startTime = this.formatDateToTime(dayGroup.get('hourInit')?.value);
          const endTime = this.formatDateToTime(dayGroup.get('hourEnd')?.value);

          schedules.push({
            dayNumber: dayId,
            startTime,
            endTime
          });
        }
      });

      // Only include channels with schedules
      if (isActive && schedules.length > 0) {
        updatePayload.push({
          channelId,
          channelSelected: true,
          schedules
        });
      } else if (!isActive) {
        // Include inactive channels to clear them
        updatePayload.push({
          channelId,
          channelSelected: false,
          schedules: []
        });
      }
    });

    if (updatePayload.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay horarios configurados para guardar'
      });
      return;
    }

    this.isSaving.set(true);
    const restId = this.restaurantId();

    this.restaurantService.updateSchedule(restId, updatePayload).subscribe({
      next: () => {
        const totalSchedules = updatePayload.reduce((sum, ch) => sum + ch.schedules.length, 0);
        const channelsAffected = updatePayload.filter(ch => ch.channelSelected).length;

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `${totalSchedules} horarios guardados en ${channelsAffected} canal${channelsAffected > 1 ? 'es' : ''}`
        });

        this.isSaving.set(false);
      },
      error: (error) => {
        console.error('Error saving schedules:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudieron guardar los horarios'
        });
        this.isSaving.set(false);
      }
    });
  }

  /**
   * Format time to 12-hour display format
   */
  formatTimeDisplay(date: Date | null): string {
    if (!date) return '—';

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12

    const minutesStr = minutes.toString().padStart(2, '0');

    return `${hours}:${minutesStr} ${ampm}`;
  }

  /**
   * Open edit dialog for individual day schedule
   */
  openEditDaySchedule(channelIndex: number, dayIndex: number): void {
    this.editingChannelIndex.set(channelIndex);
    this.editingDayIndex.set(dayIndex);
    this.showEditDialog.set(true);
  }

  /**
   * Close edit dialog
   */
  closeEditDialog(): void {
    this.showEditDialog.set(false);
    this.editingChannelIndex.set(-1);
    this.editingDayIndex.set(-1);
  }

  /**
   * Handle save from edit dialog
   */
  onEditDialogSave(times: { startTime: Date, endTime: Date }): void {
    const channelIndex = this.editingChannelIndex();
    const dayIndex = this.editingDayIndex();

    if (channelIndex >= 0 && dayIndex >= 0) {
      const dayGroup = this.getDayGroup(channelIndex, dayIndex);
      dayGroup.get('hourInit')?.setValue(times.startTime);
      dayGroup.get('hourEnd')?.setValue(times.endTime);
    }

    this.closeEditDialog();

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Horario actualizado correctamente'
    });
  }
}
