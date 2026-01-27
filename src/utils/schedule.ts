/**
 * Schedule utilities for converting local times to UTC cron expressions.
 *
 * Note: Timezone offsets are calculated at publish time. For timezones with DST,
 * the schedule may drift by an hour when clocks change. Re-run `bh publish` after
 * DST transitions to update the workflow schedules.
 */

export interface LocalTime {
  hour: number;
  minute: number;
}

/**
 * Parse a time string like "06:00" or "18:30" into hour and minute.
 */
export function parseTime(time: string): LocalTime {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid time format: ${time}. Expected HH:MM (e.g., "06:00")`);
  }

  const hour = parseInt(match[1]!, 10);
  const minute = parseInt(match[2]!, 10);

  if (hour < 0 || hour > 23) {
    throw new Error(`Invalid hour: ${hour}. Must be 0-23.`);
  }
  if (minute < 0 || minute > 59) {
    throw new Error(`Invalid minute: ${minute}. Must be 0-59.`);
  }

  return { hour, minute };
}

/**
 * Get the UTC offset in minutes for a given timezone at the current time.
 * Positive values mean ahead of UTC (e.g., +60 for UTC+1).
 * Negative values mean behind UTC (e.g., -300 for UTC-5).
 */
export function getTimezoneOffset(timezone: string): number {
  const now = new Date();

  // Get the time in the target timezone
  const localString = now.toLocaleString('en-US', { timeZone: timezone });
  const localDate = new Date(localString);

  // Get the time in UTC
  const utcString = now.toLocaleString('en-US', { timeZone: 'UTC' });
  const utcDate = new Date(utcString);

  // Difference in minutes (local - UTC)
  return Math.round((localDate.getTime() - utcDate.getTime()) / 60000);
}

/**
 * Convert a local time to UTC given a timezone.
 */
export function localTimeToUtc(time: LocalTime, timezone: string): LocalTime {
  const offsetMinutes = getTimezoneOffset(timezone);

  // Convert local time to total minutes since midnight
  const localMinutes = time.hour * 60 + time.minute;

  // Subtract offset to get UTC (if local is ahead of UTC, UTC is earlier)
  let utcMinutes = localMinutes - offsetMinutes;

  // Handle day wraparound
  if (utcMinutes < 0) {
    utcMinutes += 24 * 60;
  } else if (utcMinutes >= 24 * 60) {
    utcMinutes -= 24 * 60;
  }

  return {
    hour: Math.floor(utcMinutes / 60),
    minute: utcMinutes % 60,
  };
}

/**
 * Generate a cron expression for a daily schedule at the given UTC time.
 * Format: "minute hour * * *" (every day)
 */
export function toDailyCron(utcTime: LocalTime): string {
  return `${utcTime.minute} ${utcTime.hour} * * *`;
}

/**
 * Generate a cron expression for weekdays at the given UTC time.
 * Format: "minute hour * * 1-5" (Monday-Friday)
 */
export function toWeekdaysCron(utcTime: LocalTime): string {
  return `${utcTime.minute} ${utcTime.hour} * * 1-5`;
}

/**
 * Generate a cron expression for Sundays at the given UTC time.
 * Format: "minute hour * * 0" (Sunday)
 */
export function toSundayCron(utcTime: LocalTime): string {
  return `${utcTime.minute} ${utcTime.hour} * * 0`;
}

/**
 * Convert a local time string and timezone to a daily cron expression.
 */
export function localTimeToDailyCron(time: string, timezone: string): string {
  const local = parseTime(time);
  const utc = localTimeToUtc(local, timezone);
  return toDailyCron(utc);
}

/**
 * Convert a local time string and timezone to a weekdays cron expression.
 */
export function localTimeToWeekdaysCron(time: string, timezone: string): string {
  const local = parseTime(time);
  const utc = localTimeToUtc(local, timezone);
  return toWeekdaysCron(utc);
}

/**
 * Convert a local time string and timezone to a Sunday cron expression.
 */
export function localTimeToSundayCron(time: string, timezone: string): string {
  const local = parseTime(time);
  const utc = localTimeToUtc(local, timezone);
  return toSundayCron(utc);
}

export interface ScheduleCrons {
  daily: string;
  morningWeekdays: string;
  workdayStartupWeekdays: string;
  workdayShutdownWeekdays: string;
  eveningWeekdays: string;
  sundayEvening: string;
}

/**
 * Generate all cron expressions from schedule config.
 */
export function generateScheduleCrons(schedule: {
  timezone: string;
  daily: string;
  rituals: {
    morning: string;
    workdayStartup: string;
    workdayShutdown: string;
    evening: string;
    weeklyPreview: string;
  };
}): ScheduleCrons {
  return {
    daily: localTimeToDailyCron(schedule.daily, schedule.timezone),
    morningWeekdays: localTimeToWeekdaysCron(schedule.rituals.morning, schedule.timezone),
    workdayStartupWeekdays: localTimeToWeekdaysCron(schedule.rituals.workdayStartup, schedule.timezone),
    workdayShutdownWeekdays: localTimeToWeekdaysCron(schedule.rituals.workdayShutdown, schedule.timezone),
    eveningWeekdays: localTimeToWeekdaysCron(schedule.rituals.evening, schedule.timezone),
    sundayEvening: localTimeToSundayCron(schedule.rituals.weeklyPreview, schedule.timezone),
  };
}
