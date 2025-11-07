/**
 * Notification Models
 * Models for Push Notifications and SMS Notifications Calendar
 */

/**
 * Launch Type Enum
 */
export enum LaunchType {
  ONE_HOT = 1,      // Send immediately
  SCHEDULE = 2,     // Send at specific date/time
  RECURRENT = 3,    // Send on recurring schedule
}

/**
 * Push Notification Type Enum
 */
export enum PushTypeEnum {
  ALERT = 1,
  PRODUCT = 2,
  PROMOTION = 3,
}

/**
 * Main notification data structure (from API)
 */
export interface DataPush {
  codPN: number;
  titlePN: string;
  scheduleDatePN: string | null;
  sendIt: boolean;
  isPushNotification: boolean;
  status: boolean;
  isProcessed: boolean;
  namePN?: string;
  bodyPN?: string;
  typePN?: number;
  targets?: string[];
  launchType?: LaunchType;
  recurrenceInfo?: {
    frequency: string;
    frequencyHour: string;
    dateFrom: string;
    dateTo: string | null;
  };
}

/**
 * Calendar event structure (for display)
 */
export interface NotificationEvent {
  id: string;
  title: string;
  date: string;
  extendedProps: {
    bulletcolor: string;
    type: 'push' | 'sms';
    originalPush: DataPush;
    startTime: string;
    description: string;
    status: string;
    processed: string;
  };
}

/**
 * Create/Update notification structure
 */
export interface PushStructure {
  id?: number;
  name: string;
  criteria: number[]; // Target audience IDs
  type: PushTypeEnum;
  pushMetadata: {
    title: string;
    body: string;
  };
  launchType: LaunchType;
  oneHot: OneHotSchedule;
  schedule: ScheduleConfig | null;
  recurrent: RecurrentConfig | null;
  processed?: boolean;
}

/**
 * Immediate send configuration
 */
export interface OneHotSchedule {
  send: boolean;
}

/**
 * Scheduled send configuration
 */
export interface ScheduleConfig {
  dateSchedule: string; // Format: YYYY-MM-DD HH:MM:SS
}

/**
 * Recurrent send configuration
 */
export interface RecurrentConfig {
  frequency: string;      // Days of week: "0,1,2" (Sun=0, Mon=1, etc.)
  frequencyHour: string;  // Time: "14:00"
  dateFrom: string;       // Start date: YYYY-MM-DD
  dateTo: string | null;  // End date (optional): YYYY-MM-DD
}

/**
 * History response with pagination
 */
export interface HistoryPushResponse {
  data: DataPush[];
  metadata: {
    totalActive: number;
    totalInactive: number;
    page: number;
    perPage: number;
    pageCount: number;
    totalCount: number;
  };
}

/**
 * Target audience/public
 */
export interface TargetAudience {
  idTargetPublic: number;
  nameTargetPublic: string;
  description?: string;
  totalCustomers?: number;
}

/**
 * Authorization response
 */
export interface AuthorizationResponse {
  success: boolean;
  message: string;
  codeSent?: boolean;
}

/**
 * Send notification response
 */
export interface SendNotificationResponse {
  success: boolean;
  message: string;
  notificationSent?: boolean;
}

/**
 * Push notification types (for dropdown)
 */
export interface PushType {
  id: PushTypeEnum;
  name: string;
  description?: string;
}

/**
 * Calendar statistics
 */
export interface CalendarStats {
  total: number;
  pushCount: number;
  smsCount: number;
  processedCount: number;
  pendingCount: number;
}

/**
 * Notification form value
 */
export interface NotificationFormValue {
  name: string;
  criteria: number[];
  type: PushTypeEnum;
  title: string;
  body: string;
  launchType: LaunchType;
  scheduleDate?: string;
  recurrenceFrequency?: string;
  recurrenceHour?: string;
  recurrenceDateFrom?: string;
  recurrenceDateTo?: string;
}

/**
 * History filters
 */
export interface HistoryFilters {
  pageNumber: number;
  pageSize: number;
  filter?: string;
  status?: boolean;
  from?: string;
  to?: string;
}

/**
 * Dialog control events
 */
export interface DialogControlEvent {
  action: 'open' | 'close' | 'refresh';
  data?: any;
}

/**
 * Empty history response
 */
export const EMPTY_HISTORY_RESPONSE: HistoryPushResponse = {
  data: [],
  metadata: {
    totalActive: 0,
    totalInactive: 0,
    page: 1,
    perPage: 10,
    pageCount: 0,
    totalCount: 0
  }
};

/**
 * Push notification type options
 */
export const PUSH_TYPE_OPTIONS: PushType[] = [
  { id: PushTypeEnum.ALERT, name: 'Alerta', description: 'Notificación de alerta' },
  { id: PushTypeEnum.PRODUCT, name: 'Producto', description: 'Notificación de producto' },
  { id: PushTypeEnum.PROMOTION, name: 'Promoción', description: 'Notificación promocional' }
];

/**
 * Days of week for recurrence
 */
export interface DayOfWeek {
  value: number;
  label: string;
  shortLabel: string;
}

export const DAYS_OF_WEEK: DayOfWeek[] = [
  { value: 0, label: 'Domingo', shortLabel: 'Dom' },
  { value: 1, label: 'Lunes', shortLabel: 'Lun' },
  { value: 2, label: 'Martes', shortLabel: 'Mar' },
  { value: 3, label: 'Miércoles', shortLabel: 'Mié' },
  { value: 4, label: 'Jueves', shortLabel: 'Jue' },
  { value: 5, label: 'Viernes', shortLabel: 'Vie' },
  { value: 6, label: 'Sábado', shortLabel: 'Sáb' }
];

/**
 * Hour options for recurrence (8 AM - 9 PM)
 */
export const HOUR_OPTIONS: string[] = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00'
];
