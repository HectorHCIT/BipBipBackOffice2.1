/**
 * AsyncValue - Pattern for handling async operations with 3 states
 *
 * Inspired by Riverpod's AsyncValue from Flutter
 * Provides type-safe handling of loading, success, and error states
 */

/**
 * Loading State - Request in progress
 */
export interface AsyncLoading {
  readonly state: 'loading';
}

/**
 * Success State - Request completed successfully
 */
export interface AsyncSuccess<T> {
  readonly state: 'success';
  readonly data: T;
}

/**
 * Error State - Request failed
 */
export interface AsyncError {
  readonly state: 'error';
  readonly error: Error;
  readonly message: string;
}

/**
 * AsyncValue Union Type
 *
 * Represents one of three possible states:
 * - loading: Request in progress
 * - success: Request completed with data
 * - error: Request failed with error
 */
export type AsyncValue<T> = AsyncLoading | AsyncSuccess<T> | AsyncError;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if AsyncValue is in loading state
 */
export function isLoading<T>(value: AsyncValue<T>): value is AsyncLoading {
  return value.state === 'loading';
}

/**
 * Check if AsyncValue is in success state
 */
export function isSuccess<T>(value: AsyncValue<T>): value is AsyncSuccess<T> {
  return value.state === 'success';
}

/**
 * Check if AsyncValue is in error state
 */
export function isError<T>(value: AsyncValue<T>): value is AsyncError {
  return value.state === 'error';
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a loading state
 */
export function loading(): AsyncLoading {
  return { state: 'loading' };
}

/**
 * Create a success state with data
 */
export function success<T>(data: T): AsyncSuccess<T> {
  return { state: 'success', data };
}

/**
 * Create an error state
 */
export function error(err: Error | string): AsyncError {
  const errorObj = typeof err === 'string' ? new Error(err) : err;
  return {
    state: 'error',
    error: errorObj,
    message: errorObj.message
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Map data from AsyncValue if in success state
 *
 * @example
 * const userValue = signal<AsyncValue<User>>({ state: 'success', data: user });
 * const userName = computed(() => mapData(userValue(), user => user.name, 'Unknown'));
 */
export function mapData<T, R>(
  value: AsyncValue<T>,
  mapper: (data: T) => R,
  defaultValue: R
): R {
  return isSuccess(value) ? mapper(value.data) : defaultValue;
}

/**
 * Get data from AsyncValue or return default value
 */
export function getData<T>(value: AsyncValue<T>, defaultValue: T): T {
  return isSuccess(value) ? value.data : defaultValue;
}

/**
 * Get data from AsyncValue or return null
 */
export function getDataOrNull<T>(value: AsyncValue<T>): T | null {
  return isSuccess(value) ? value.data : null;
}
