import type { Schedule } from "@/types/api.types";
import type { CalendarEvent, TimeSlot, WeekData } from "../types/timetable.types";
import { utcToVietnamTime, getCurrentVietnamTime, formatUtcToVietnamTime, formatUtcToVietnamDate } from "@/utils/timezone-utils";

// Generate color palette for group color-coding
const GROUP_COLORS = [
  { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-900" },
  { bg: "bg-green-100", border: "border-green-300", text: "text-green-900" },
  { bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-900" },
  { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-900" },
  { bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-900" },
  { bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-900" },
  { bg: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-900" },
  { bg: "bg-red-100", border: "border-red-300", text: "text-red-900" },
  { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-900" },
  { bg: "bg-cyan-100", border: "border-cyan-300", text: "text-cyan-900" },
];

// Cache for group colors to ensure consistency
const groupColorCache = new Map<number, typeof GROUP_COLORS[0]>();

export const getGroupColor = (groupId: number): typeof GROUP_COLORS[0] => {
  if (groupColorCache.has(groupId)) {
    return groupColorCache.get(groupId)!;
  }

  const color = GROUP_COLORS[groupId % GROUP_COLORS.length];
  groupColorCache.set(groupId, color);
  return color;
};

export const convertScheduleToEvent = (schedule: Schedule): CalendarEvent => {
  const color = getGroupColor(schedule.group_id);

  return {
    id: schedule.id || 0,
    title: schedule.group_name,
    // Convert UTC times from server to Vietnam local time for display
    start: utcToVietnamTime(schedule.start_time),
    end: utcToVietnamTime(schedule.end_time),
    group_name: schedule.group_name,
    teacher_name: schedule.teacher?.account?.name || "Chưa có giáo viên",
    room_name: schedule.room?.name || "Chưa có phòng",
    delivery_mode: schedule.delivery_mode,
    meeting_link: schedule.meeting_link,
    color: `${color.bg} ${color.border} ${color.text}`,
    textColor: color.text,
  };
};

export const getWeekStart = (date: Date | string): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

export const getWeekEnd = (weekStart: Date): Date => {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d;
};

export const formatTime = (date: Date): string => {
  // Date object is already in Vietnam timezone from our conversion
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const formatDate = (date: Date): string => {
  // Date object is already in Vietnam timezone from our conversion
  return date.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
};

export const formatDateFull = (date: Date): string => {
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const isToday = (date: Date): boolean => {
  // Use Vietnam current time for today comparison
  const vietnamToday = getCurrentVietnamTime();
  return date.toDateString() === vietnamToday.toDateString();
};

export const isSameWeek = (date1: Date, date2: Date): boolean => {
  const weekStart1 = getWeekStart(date1);
  const weekStart2 = getWeekStart(date2);
  return weekStart1.getTime() === weekStart2.getTime();
};

export const generateWeekData = (weekStart: Date, events: CalendarEvent[]): WeekData => {
  const weekEnd = getWeekEnd(weekStart);
  const days = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);

    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });

    days.push({ date, events: dayEvents });
  }

  return { weekStart, weekEnd, days };
};

export const generateTimeSlots = (events: CalendarEvent[], startHour = 7, endHour = 22): TimeSlot[] => {
  const slots: TimeSlot[] = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    const timeString = `${hour.toString().padStart(2, '0')}:00`;

    const slotEvents = events.filter(event => {
      const eventHour = event.start.getHours();
      return eventHour === hour;
    });

    slots.push({
      time: timeString,
      events: slotEvents,
    });
  }

  return slots;
};

export const getEventDuration = (event: CalendarEvent): string => {
  const durationMs = event.end.getTime() - event.start.getTime();
  const durationMinutes = Math.floor(durationMs / (1000 * 60));
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours > 0) {
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  }
  return `${minutes}m`;
};

export const isEventActive = (event: CalendarEvent): boolean => {
  // Use Vietnam current time for active event comparison
  const vietnamNow = getCurrentVietnamTime();
  return vietnamNow >= event.start && vietnamNow <= event.end;
};

export const getWeekRange = (weekStart: Date): string => {
  const weekEnd = getWeekEnd(weekStart);

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${weekStart.getDate()}-${weekEnd.getDate()} tháng ${weekStart.getMonth() + 1}, ${weekStart.getFullYear()}`;
  } else {
    return `${weekStart.getDate()} tháng ${weekStart.getMonth() + 1} - ${weekEnd.getDate()} tháng ${weekEnd.getMonth() + 1}, ${weekStart.getFullYear()}`;
  }
};

export const navigateWeek = (currentWeek: Date, direction: 'prev' | 'next'): Date => {
  const newWeek = new Date(currentWeek);
  newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
  return newWeek;
};

export const goToToday = (): Date => {
  // Use Vietnam current time for "today" navigation
  return getWeekStart(getCurrentVietnamTime());
};