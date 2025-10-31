/**
 * Schedule Models
 * Interfaces for managing restaurant operating hours by channel
 */

/**
 * Channel schedule structure returned from API
 * Contains all schedules for a specific service channel
 */
export interface RESTSchedule {
  channelId: number;       // Service channel ID (1=Delivery, 2=Takeout, 5=Restaurant)
  channel: string;         // Channel name
  schedules: Schedule[];   // Array of daily schedules (up to 7 days)
}

/**
 * Individual day schedule
 * Represents operating hours for a specific day of the week
 */
export interface Schedule {
  schedulesId: number;         // Schedule record ID
  schedulesDaysId: number;     // Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
  day: string;                 // Day name in Spanish
  shedulesStartTime: string;   // Start time in format "HH:MM:SS" (24h format)
  shedulesEndTime: string;     // End time in format "HH:MM:SS" (24h format)
  active: boolean;             // Whether this schedule is active
}

/**
 * Update schedule payload
 * Structure for updating restaurant schedules via API
 */
export interface UpdateSchedule {
  channelId: number;           // Channel to update
  channelSelected: boolean;    // Whether channel is enabled
  schedules: ScheduleTime[];   // Array of day schedules
}

/**
 * Schedule time entry
 * Individual day schedule for update payload
 */
export interface ScheduleTime {
  dayNumber: number;     // Day of week (0-6)
  startTime: string;     // Start time "HH:MM:SS"
  endTime: string;       // End time "HH:MM:SS"
}

/**
 * Day of week structure
 * Used for displaying and managing days
 */
export interface DayOfWeek {
  id: number;        // 0-6 (Sunday to Saturday)
  name: string;      // Day name in Spanish
  shortName: string; // Abbreviated day name (e.g., "Lun", "Mar")
}

/**
 * Quick schedule configuration
 * Used for bulk schedule operations
 */
export interface QuickScheduleConfig {
  startTime: string;           // Start time "HH:MM"
  endTime: string;             // End time "HH:MM"
  selectedDays: number[];      // Array of day IDs (0-6)
  selectedChannels: number[];  // Array of channel IDs
}

/**
 * Days of the week constants
 */
export const DAYS_OF_WEEK: DayOfWeek[] = [
  { id: 0, name: 'Domingo', shortName: 'Dom' },
  { id: 1, name: 'Lunes', shortName: 'Lun' },
  { id: 2, name: 'Martes', shortName: 'Mar' },
  { id: 3, name: 'Miércoles', shortName: 'Mié' },
  { id: 4, name: 'Jueves', shortName: 'Jue' },
  { id: 5, name: 'Viernes', shortName: 'Vie' },
  { id: 6, name: 'Sábado', shortName: 'Sáb' }
];

/**
 * Channel constants
 * Only these channels are used for restaurant schedules
 */
export const SCHEDULE_CHANNELS = {
  DELIVERY: 1,
  TAKEOUT: 2,
  RESTAURANT: 5
} as const;

/**
 * Channel display information
 */
export interface ChannelInfo {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export const CHANNEL_INFO: Record<number, ChannelInfo> = {
  1: { id: 1, name: 'Delivery', icon: 'pi pi-send', color: '#10B981' },      // green
  2: { id: 2, name: 'Para Llevar', icon: 'pi pi-shopping-bag', color: '#F59E0B' },  // amber
  5: { id: 5, name: 'Restaurante', icon: 'pi pi-building', color: '#3B82F6' }       // blue
};
