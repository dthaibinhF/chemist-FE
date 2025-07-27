import { format, parseISO } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

export const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh'; // GMT+7
export const UTC_TIMEZONE = 'UTC';

/**
 * Convert UTC date from server to Vietnam local time (GMT+7)
 * @param utcDate - UTC date string or Date object from server
 * @returns Date object in Vietnam timezone
 */
export const utcToVietnamTime = (utcDate: string | Date): Date => {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  return toZonedTime(date, VIETNAM_TIMEZONE);
};

/**
 * Convert Vietnam local time to UTC for server
 * @param localDate - Local date in Vietnam timezone
 * @returns UTC date object
 */
export const vietnamTimeToUtc = (localDate: Date): Date => {
  return fromZonedTime(localDate, VIETNAM_TIMEZONE);
};

/**
 * Format UTC date to Vietnam local time string
 * @param utcDate - UTC date string or Date object
 * @param formatString - date-fns format string (default: 'HH:mm:ss')
 * @returns Formatted time string in Vietnam timezone
 */
export const formatUtcToVietnamTime = (
  utcDate: string | Date,
  formatString: string = 'HH:mm:ss'
): string => {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  return formatInTimeZone(date, VIETNAM_TIMEZONE, formatString);
};

/**
 * Format UTC date to Vietnam local date string
 * @param utcDate - UTC date string or Date object
 * @param formatString - date-fns format string (default: 'dd/MM/yyyy')
 * @returns Formatted date string in Vietnam timezone
 */
export const formatUtcToVietnamDate = (
  utcDate: string | Date,
  formatString: string = 'dd/MM/yyyy'
): string => {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  return formatInTimeZone(date, VIETNAM_TIMEZONE, formatString);
};

/**
 * Format UTC datetime to Vietnam local datetime string
 * @param utcDate - UTC date string or Date object
 * @param formatString - date-fns format string (default: 'dd/MM/yyyy HH:mm')
 * @returns Formatted datetime string in Vietnam timezone
 */
export const formatUtcToVietnamDateTime = (
  utcDate: string | Date,
  formatString: string = 'dd/MM/yyyy HH:mm'
): string => {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  return formatInTimeZone(date, VIETNAM_TIMEZONE, formatString);
};

/**
 * Convert time string (HH:mm or HH:mm:ss) to proper Vietnam time for a given date
 * @param timeString - Time string in HH:mm or HH:mm:ss format
 * @param baseDate - Base date to combine with time (default: today)
 * @returns Date object representing the time in Vietnam timezone
 */
export const parseVietnamTime = (timeString: string, baseDate?: Date): Date => {
  try {
    // Handle empty or invalid input
    if (!timeString || typeof timeString !== 'string') {
      throw new Error('Invalid time string provided');
    }

    // Validate time format
    if (!isTimeOnlyFormat(timeString)) {
      throw new Error(`Invalid time format: ${timeString}. Expected HH:mm or HH:mm:ss`);
    }

    const base = baseDate || new Date();
    const [hours, minutes, seconds = '0'] = timeString.split(':').map(Number);

    // Validate time values
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || parseInt(seconds.toString()) < 0 || parseInt(seconds.toString()) > 59) {
      throw new Error(`Invalid time values: ${timeString}`);
    }

    const vietnamDate = toZonedTime(base, VIETNAM_TIMEZONE);
    vietnamDate.setHours(hours, minutes, parseInt(seconds.toString()), 0);

    return vietnamDate;
  } catch (error) {
    console.error('Error parsing Vietnam time:', error, 'Input:', timeString);
    // Return default time (8 AM Vietnam time)
    const base = baseDate || new Date();
    const vietnamDate = toZonedTime(base, VIETNAM_TIMEZONE);
    vietnamDate.setHours(8, 0, 0, 0);
    return vietnamDate;
  }
};

/**
 * Convert Vietnam time to UTC time string for API submission
 * @param timeString - Time string in HH:mm or HH:mm:ss format
 * @param baseDate - Base date to combine with time (default: today)
 * @returns UTC time string in HH:mm:ss format
 */
export const convertVietnamTimeToUtcString = (timeString: string, baseDate?: Date): string => {
  try {
    // Handle empty or invalid input
    if (!timeString || typeof timeString !== 'string') {
      console.warn('Invalid time string provided to convertVietnamTimeToUtcString:', timeString);
      return '01:00:00'; // Default fallback (8 AM Vietnam = 1 AM UTC)
    }

    // Validate time format
    if (!isTimeOnlyFormat(timeString)) {
      throw new Error(`Invalid time format: ${timeString}. Expected HH:mm or HH:mm:ss`);
    }

    const vietnamTime = parseVietnamTime(timeString, baseDate);
    const utcTime = vietnamTimeToUtc(vietnamTime);
    return format(utcTime, 'HH:mm:ss');
  } catch (error) {
    console.error('Error converting Vietnam time to UTC:', error, 'Input:', timeString);
    return '01:00:00'; // Safe fallback (8 AM Vietnam = 1 AM UTC)
  }
};

/**
 * Detect if a string is in time-only format (HH:mm:ss or HH:mm)
 * @param timeString - String to check
 * @returns true if string is time-only format
 */
export const isTimeOnlyFormat = (timeString: string): boolean => {
  // Match HH:mm:ss or HH:mm format
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(timeString);
};

/**
 * Convert UTC time string to Vietnam time string for display
 * @param utcTimeString - UTC time string in HH:mm:ss format or full datetime
 * @param baseDate - Base date to combine with time (default: today)
 * @returns Vietnam time string in HH:mm:ss format
 */
export const convertUtcTimeToVietnamString = (utcTimeString: string, baseDate?: Date): string => {
  try {
    // Handle empty or invalid input
    if (!utcTimeString || typeof utcTimeString !== 'string') {
      console.warn('Invalid time string provided to convertUtcTimeToVietnamString:', utcTimeString);
      return '08:00:00'; // Default fallback
    }

    // If it's a time-only format (HH:mm:ss or HH:mm)
    if (isTimeOnlyFormat(utcTimeString)) {
      const base = baseDate || new Date();
      const [hours, minutes, seconds = '0'] = utcTimeString.split(':').map(Number);

      // Validate time values
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || parseInt(seconds.toString()) < 0 || parseInt(seconds.toString()) > 59) {
        throw new Error(`Invalid time values: ${utcTimeString}`);
      }

      const utcDate = new Date(base);
      utcDate.setUTCHours(hours, minutes, parseInt(seconds.toString()), 0);

      return formatInTimeZone(utcDate, VIETNAM_TIMEZONE, 'HH:mm:ss');
    } else {
      // Handle full datetime string
      const date = parseISO(utcTimeString);
      return formatInTimeZone(date, VIETNAM_TIMEZONE, 'HH:mm:ss');
    }
  } catch (error) {
    console.error('Error converting UTC time to Vietnam time:', error, 'Input:', utcTimeString);
    return '08:00:00'; // Safe fallback
  }
};

/**
 * Get current Vietnam time
 * @returns Current date in Vietnam timezone
 */
export const getCurrentVietnamTime = (): Date => {
  return toZonedTime(new Date(), VIETNAM_TIMEZONE);
};

/**
 * Check if a date is today in Vietnam timezone
 * @param date - Date to check
 * @returns true if the date is today in Vietnam timezone
 */
export const isToday = (date: Date | string): boolean => {
  const inputDate = typeof date === 'string' ? parseISO(date) : date;
  const vietnamInputDate = toZonedTime(inputDate, VIETNAM_TIMEZONE);
  const vietnamToday = getCurrentVietnamTime();

  return format(vietnamInputDate, 'yyyy-MM-dd') === format(vietnamToday, 'yyyy-MM-dd');
};

/**
 * Format datetime-local input value from UTC date
 * @param utcDate - UTC date string or Date object
 * @returns datetime-local compatible string (YYYY-MM-DDTHH:mm)
 */
export const formatUtcToDateTimeLocal = (utcDate: string | Date): string => {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  return formatInTimeZone(date, VIETNAM_TIMEZONE, "yyyy-MM-dd'T'HH:mm");
};

/**
 * Parse datetime-local input value to UTC for API submission
 * @param dateTimeLocalValue - datetime-local input value (YYYY-MM-DDTHH:mm)
 * @returns UTC date object
 */
export const parseDateTimeLocalToUtc = (dateTimeLocalValue: string): Date => {
  // Parse as if it's already in Vietnam timezone
  const localDate = parseISO(dateTimeLocalValue);
  return fromZonedTime(localDate, VIETNAM_TIMEZONE);
};

/**
 * Parse API OffsetDateTime (with +07:00 timezone) to JavaScript Date
 * @param apiDateTime - API datetime string (e.g., "2025-07-25T08:00:00+07:00")
 * @returns JavaScript Date object
 */
export const parseApiDateTime = (apiDateTime: string): Date => {
  try {
    if (!apiDateTime || typeof apiDateTime !== 'string') {
      console.warn('Invalid API datetime provided:', apiDateTime);
      return new Date(); // Fallback to current time
    }

    // Parse ISO string with timezone offset
    return parseISO(apiDateTime);
  } catch (error) {
    console.error('Error parsing API datetime:', error, 'Input:', apiDateTime);
    return new Date(); // Safe fallback
  }
};

/**
 * Format JavaScript Date for API submission (will be converted to +07:00 by server)
 * @param date - JavaScript Date object
 * @returns ISO string for API submission
 */
export const formatDateTimeForApi = (date: Date): string => {
  try {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.warn('Invalid date provided to formatDateTimeForApi:', date);
      return new Date().toISOString(); // Fallback to current time
    }

    return date.toISOString();
  } catch (error) {
    console.error('Error formatting date for API:', error, 'Input:', date);
    return new Date().toISOString(); // Safe fallback
  }
};

/**
 * Convert API OffsetDateTime to datetime-local input format
 * @param apiDateTime - API datetime string (e.g., "2025-07-25T08:00:00+07:00")
 * @returns datetime-local compatible string (YYYY-MM-DDTHH:mm)
 */
export const formatApiDateTimeForInput = (apiDateTime: string): string => {
  try {
    if (!apiDateTime || typeof apiDateTime !== 'string') {
      console.warn('Invalid API datetime provided to formatApiDateTimeForInput:', apiDateTime);
      return format(new Date(), "yyyy-MM-dd'T'HH:mm"); // Fallback to current time
    }

    // Parse the API datetime (which includes timezone offset)
    const date = parseApiDateTime(apiDateTime);

    // Since the API already sends Vietnam time (+07:00), we just need to format it
    // for the datetime-local input without further timezone conversion
    return format(date, "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    console.error('Error formatting API datetime for input:', error, 'Input:', apiDateTime);
    return format(new Date(), "yyyy-MM-dd'T'HH:mm"); // Safe fallback
  }
};

/**
 * Check if a datetime string is in API OffsetDateTime format
 * @param dateTimeString - String to check
 * @returns true if string appears to be API OffsetDateTime format
 */
export const isApiDateTimeFormat = (dateTimeString: string): boolean => {
  try {
    if (!dateTimeString || typeof dateTimeString !== 'string') {
      return false;
    }

    // Check for timezone offset pattern (+XX:XX or Z)
    const offsetPattern = /(\+\d{2}:\d{2}|Z)$/;
    return offsetPattern.test(dateTimeString);
  } catch (error) {
    console.error('Error checking API datetime format:', error);
    return false;
  }
};