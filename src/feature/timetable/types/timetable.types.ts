import type { Schedule } from "@/types/api.types";

// View modes for the timetable
export type TimetableViewMode = "weekly" | "daily";

// User permissions for timetable operations
export interface TimetablePermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

// Timetable state interface
export interface TimetableState {
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
  viewMode: TimetableViewMode;
  selectedDate: string;
  filters: {
    group_id?: number;
    teacher_id?: number;
    room_id?: number;
    start_date?: string;
    end_date?: string;
    delivery_mode?: string;
  };
  searchQuery: string;
}

// Calendar event interface for rendering
export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  group_name: string;
  teacher_name: string;
  room_name: string;
  delivery_mode: string;
  meeting_link?: string;
  color: string; // Color-coded by group
  textColor: string;
}

// Time slot interface for daily view
export interface TimeSlot {
  time: string;
  events: CalendarEvent[];
}

// Week data interface
export interface WeekData {
  weekStart: Date;
  weekEnd: Date;
  days: {
    date: Date;
    events: CalendarEvent[];
  }[];
}

// Filter options interfaces
export interface FilterOption {
  value: number;
  label: string;
}

export interface FilterOptions {
  groups: FilterOption[];
  teachers: FilterOption[];
  rooms: FilterOption[];
  deliveryModes: FilterOption[];
}