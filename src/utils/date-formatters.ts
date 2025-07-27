import {
  formatUtcToVietnamTime,
  formatUtcToVietnamDate,
  formatUtcToVietnamDateTime,
  convertUtcTimeToVietnamString,
  isTimeOnlyFormat
} from './timezone-utils';

/**
 * Common date format patterns for Vietnamese locale
 */
export const DATE_FORMATS = {
  // Time formats
  TIME_24H: 'HH:mm',
  TIME_24H_SECONDS: 'HH:mm:ss',
  TIME_12H: 'h:mm a',

  // Date formats  
  DATE_SHORT: 'dd/MM/yyyy',
  DATE_MEDIUM: 'dd MMM yyyy',
  DATE_LONG: 'dd MMMM yyyy',
  DATE_ISO: 'yyyy-MM-dd',

  // DateTime formats
  DATETIME_SHORT: 'dd/MM/yyyy HH:mm',
  DATETIME_MEDIUM: 'dd MMM yyyy HH:mm',
  DATETIME_LONG: 'dd MMMM yyyy HH:mm:ss',

  // Day formats
  DAY_OF_WEEK: 'EEEE',
  DAY_OF_WEEK_SHORT: 'EEE',
} as const;

/**
 * Format time for display (converts UTC to Vietnam timezone)
 * @param utcTime - UTC time string (HH:mm:ss) or Date object
 * @param format - Time format (default: HH:mm)
 * @returns Formatted time string in Vietnam timezone
 */
export const displayTime = (utcTime: string | Date, format: string = DATE_FORMATS.TIME_24H): string => {
  try {
    // Handle empty or invalid input
    if (!utcTime) {
      console.warn('Empty time provided to displayTime');
      return '08:00'; // Default fallback
    }

    // If it's a time-only string (HH:mm:ss format from server)
    if (typeof utcTime === 'string' && isTimeOnlyFormat(utcTime)) {
      const vietnamTimeString = convertUtcTimeToVietnamString(utcTime);
      // Format according to requested format
      if (format === DATE_FORMATS.TIME_24H) {
        return vietnamTimeString.substring(0, 5); // HH:mm
      } else if (format === DATE_FORMATS.TIME_24H_SECONDS) {
        return vietnamTimeString; // HH:mm:ss
      }
      return vietnamTimeString.substring(0, 5); // Default to HH:mm
    } else {
      // Handle full datetime
      return formatUtcToVietnamTime(utcTime, format);
    }
  } catch (error) {
    console.error('Error formatting time for display:', error, 'Input:', utcTime);
    return '08:00'; // Safe fallback
  }
};

/**
 * Format date for display (converts UTC to Vietnam timezone)
 * @param utcDate - UTC date string or Date object  
 * @param format - Date format (default: dd/MM/yyyy)
 * @returns Formatted date string in Vietnam timezone
 */
export const displayDate = (utcDate: string | Date, format: string = DATE_FORMATS.DATE_SHORT): string => {
  return formatUtcToVietnamDate(utcDate, format);
};

/**
 * Format datetime for display (converts UTC to Vietnam timezone)
 * @param utcDateTime - UTC datetime string or Date object
 * @param format - DateTime format (default: dd/MM/yyyy HH:mm)  
 * @returns Formatted datetime string in Vietnam timezone
 */
export const displayDateTime = (utcDateTime: string | Date, format: string = DATE_FORMATS.DATETIME_SHORT): string => {
  return formatUtcToVietnamDateTime(utcDateTime, format);
};

/**
 * Format schedule time range for display
 * @param startTime - UTC start time string (HH:mm:ss) or Date object
 * @param endTime - UTC end time string (HH:mm:ss) or Date object
 * @returns Formatted time range string (e.g., "08:00 - 10:00")
 */
export const displayTimeRange = (startTime: string | Date, endTime: string | Date): string => {
  try {
    const start = displayTime(startTime);
    const end = displayTime(endTime);
    return `${start} - ${end}`;
  } catch (error) {
    console.error('Error formatting time range:', error, 'Start:', startTime, 'End:', endTime);
    return '08:00 - 10:00'; // Safe fallback
  }
};

/**
 * Format day of week in Vietnamese
 * @param date - Date string or Date object
 * @returns Vietnamese day of week string
 */
export const displayDayOfWeek = (date: string | Date): string => {
  const dayMap: Record<string, string> = {
    'Monday': 'Thứ 2',
    'Tuesday': 'Thứ 3',
    'Wednesday': 'Thứ 4',
    'Thursday': 'Thứ 5',
    'Friday': 'Thứ 6',
    'Saturday': 'Thứ 7',
    'Sunday': 'Chủ nhật',
  };

  const englishDay = formatUtcToVietnamDate(date, DATE_FORMATS.DAY_OF_WEEK);
  return dayMap[englishDay] || englishDay;
};

/**
 * Format day of week enum to Vietnamese display text
 * @param dayEnum - Day enum (MONDAY, TUESDAY, etc.)
 * @returns Vietnamese day name
 */
export const displayDayEnum = (dayEnum: string): string => {
  const dayMap: Record<string, string> = {
    'MONDAY': 'Thứ 2',
    'TUESDAY': 'Thứ 3',
    'WEDNESDAY': 'Thứ 4',
    'THURSDAY': 'Thứ 5',
    'FRIDAY': 'Thứ 6',
    'SATURDAY': 'Thứ 7',
    'SUNDAY': 'Chủ nhật',
  };

  return dayMap[dayEnum] || dayEnum;
};

/**
 * Format duration between two times
 * @param startTime - Start time string or Date object
 * @param endTime - End time string or Date object
 * @returns Duration string (e.g., "2 giờ", "1.5 giờ")
 */
export const displayDuration = (startTime: string | Date, endTime: string | Date): string => {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;

  const durationMs = end.getTime() - start.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);

  if (durationHours === 1) {
    return '1 giờ';
  } else if (durationHours % 1 === 0) {
    return `${durationHours} giờ`;
  } else {
    return `${durationHours.toFixed(1)} giờ`;
  }
};

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 * This is a simple implementation - consider using date-fns formatDistanceToNow for more advanced cases
 * @param date - Date to compare
 * @param baseDate - Base date for comparison (default: now)
 * @returns Relative time string in Vietnamese
 */
export const displayRelativeTime = (date: string | Date, baseDate?: Date): string => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const base = baseDate || new Date();

  const diffMs = targetDate.getTime() - base.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffMinutes) < 1) {
    return 'Bây giờ';
  } else if (Math.abs(diffMinutes) < 60) {
    return diffMinutes > 0 ? `Sau ${diffMinutes} phút` : `${Math.abs(diffMinutes)} phút trước`;
  } else if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `Sau ${diffHours} giờ` : `${Math.abs(diffHours)} giờ trước`;
  } else {
    return diffDays > 0 ? `Sau ${diffDays} ngày` : `${Math.abs(diffDays)} ngày trước`;
  }
};

/**
 * Check if a date is in the current week (Vietnam timezone)
 * @param date - Date to check
 * @returns true if date is in current week
 */
export const isCurrentWeek = (date: string | Date): boolean => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();

  // Get start of week (Monday) for both dates
  const getWeekStart = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
  };

  const targetWeekStart = getWeekStart(targetDate);
  const currentWeekStart = getWeekStart(now);

  return targetWeekStart.getTime() === currentWeekStart.getTime();
};

/**
 * Validate time string format (HH:mm or HH:mm:ss)
 * @param timeString - Time string to validate
 * @returns true if valid time format
 */
export const isValidTimeString = (timeString: string): boolean => {
  try {
    if (!timeString || typeof timeString !== 'string') {
      return false;
    }
    return isTimeOnlyFormat(timeString);
  } catch (error) {
    console.error('Error validating time string:', error);
    return false;
  }
};

/**
 * Validate date string format (YYYY-MM-DD)
 * @param dateString - Date string to validate
 * @returns true if valid date format
 */
export const isValidDateString = (dateString: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};