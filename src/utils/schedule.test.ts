import { describe, expect, test } from 'bun:test';
import {
  parseTime,
  localTimeToUtc,
  toDailyCron,
  toWeekdaysCron,
  toSundayCron,
  generateScheduleCrons,
} from './schedule.js';

describe('parseTime', () => {
  test('parses valid time HH:MM', () => {
    expect(parseTime('06:00')).toEqual({ hour: 6, minute: 0 });
    expect(parseTime('18:30')).toEqual({ hour: 18, minute: 30 });
    expect(parseTime('00:00')).toEqual({ hour: 0, minute: 0 });
    expect(parseTime('23:59')).toEqual({ hour: 23, minute: 59 });
  });

  test('parses single-digit hour', () => {
    expect(parseTime('6:00')).toEqual({ hour: 6, minute: 0 });
    expect(parseTime('9:30')).toEqual({ hour: 9, minute: 30 });
  });

  test('throws on invalid format', () => {
    expect(() => parseTime('6am')).toThrow('Invalid time format');
    expect(() => parseTime('6:0')).toThrow('Invalid time format');
    expect(() => parseTime('06-00')).toThrow('Invalid time format');
    expect(() => parseTime('')).toThrow('Invalid time format');
  });

  test('throws on invalid hour', () => {
    expect(() => parseTime('24:00')).toThrow('Invalid hour');
    expect(() => parseTime('25:00')).toThrow('Invalid hour');
  });

  test('throws on invalid minute', () => {
    expect(() => parseTime('06:60')).toThrow('Invalid minute');
    expect(() => parseTime('06:99')).toThrow('Invalid minute');
  });
});

describe('localTimeToUtc', () => {
  test('converts UTC time (no change)', () => {
    // UTC has no offset, so 6:00 UTC stays 6:00 UTC
    const result = localTimeToUtc({ hour: 6, minute: 0 }, 'UTC');
    expect(result).toEqual({ hour: 6, minute: 0 });
  });

  test('converts time in timezone ahead of UTC', () => {
    // London in summer (BST) is UTC+1, so 6:00 local = 5:00 UTC
    // Using a fixed timezone that's always +1
    const result = localTimeToUtc({ hour: 6, minute: 0 }, 'Etc/GMT-1');
    expect(result).toEqual({ hour: 5, minute: 0 });
  });

  test('converts time in timezone behind UTC', () => {
    // Etc/GMT+5 is 5 hours behind UTC, so 6:00 local = 11:00 UTC
    const result = localTimeToUtc({ hour: 6, minute: 0 }, 'Etc/GMT+5');
    expect(result).toEqual({ hour: 11, minute: 0 });
  });

  test('handles day wraparound forward', () => {
    // If local time is late and timezone is behind UTC, UTC might be next day
    // Etc/GMT+10 is 10 hours behind UTC, so 20:00 local = 06:00 UTC next day
    const result = localTimeToUtc({ hour: 20, minute: 0 }, 'Etc/GMT+10');
    expect(result).toEqual({ hour: 6, minute: 0 });
  });

  test('handles day wraparound backward', () => {
    // If local time is early and timezone is ahead of UTC, UTC might be previous day
    // Etc/GMT-10 is 10 hours ahead of UTC, so 4:00 local = 18:00 UTC previous day
    const result = localTimeToUtc({ hour: 4, minute: 0 }, 'Etc/GMT-10');
    expect(result).toEqual({ hour: 18, minute: 0 });
  });

  test('handles minutes correctly', () => {
    const result = localTimeToUtc({ hour: 6, minute: 30 }, 'Etc/GMT+5');
    expect(result).toEqual({ hour: 11, minute: 30 });
  });
});

describe('cron generators', () => {
  test('toDailyCron generates daily cron', () => {
    expect(toDailyCron({ hour: 6, minute: 0 })).toBe('0 6 * * *');
    expect(toDailyCron({ hour: 18, minute: 30 })).toBe('30 18 * * *');
    expect(toDailyCron({ hour: 0, minute: 0 })).toBe('0 0 * * *');
  });

  test('toWeekdaysCron generates weekday cron', () => {
    expect(toWeekdaysCron({ hour: 6, minute: 0 })).toBe('0 6 * * 1-5');
    expect(toWeekdaysCron({ hour: 18, minute: 30 })).toBe('30 18 * * 1-5');
  });

  test('toSundayCron generates Sunday cron', () => {
    expect(toSundayCron({ hour: 18, minute: 0 })).toBe('0 18 * * 0');
    expect(toSundayCron({ hour: 9, minute: 15 })).toBe('15 9 * * 0');
  });
});

describe('generateScheduleCrons', () => {
  test('generates all crons from schedule config', () => {
    // Using UTC for predictable results
    const schedule = {
      timezone: 'UTC',
      daily: '06:00',
      rituals: {
        morning: '07:00',
        evening: '18:00',
        weeklyPreview: '17:00',
      },
    };

    const crons = generateScheduleCrons(schedule);

    expect(crons.daily).toBe('0 6 * * *');
    expect(crons.morningWeekdays).toBe('0 7 * * 1-5');
    expect(crons.eveningWeekdays).toBe('0 18 * * 1-5');
    expect(crons.sundayEvening).toBe('0 17 * * 0');
  });

  test('converts times based on timezone', () => {
    // Etc/GMT+6 is 6 hours behind UTC
    // 6:00 local = 12:00 UTC
    const schedule = {
      timezone: 'Etc/GMT+6',
      daily: '06:00',
      rituals: {
        morning: '06:00',
        evening: '18:00',
        weeklyPreview: '18:00',
      },
    };

    const crons = generateScheduleCrons(schedule);

    expect(crons.daily).toBe('0 12 * * *');
    expect(crons.morningWeekdays).toBe('0 12 * * 1-5');
    expect(crons.eveningWeekdays).toBe('0 0 * * 1-5'); // 18:00 + 6 = 24:00 = 0:00
    expect(crons.sundayEvening).toBe('0 0 * * 0');
  });
});
