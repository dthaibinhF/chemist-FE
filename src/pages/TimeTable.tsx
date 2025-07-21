/*
TimeTable Feature Implementation Plan

Goal:
- Provide both daily and weekly timetable views, view-only, using backend data.

Component Structure:
1. TimeTable.tsx (main page)
   - Handles view mode (daily/weekly) toggle and filter state.
   - Fetches schedule data from backend.
   - Renders either:
     - <TimeTableWeeklyView />
     - <TimeTableDailyView />
   - Passes filtered data and state to child components.

2. TimeTableFilters.tsx
   - Dropdowns/selects for group, class, teacher, date.
   - Controls filter state in parent.

3. TimeTableWeeklyView.tsx
   - Displays a week grid (days as columns, time slots as rows or vice versa).
   - Shows schedule entries in correct slots.

4. TimeTableDailyView.tsx
   - Displays a list or grid for a single day.
   - Shows all schedule entries for the selected day.

5. TimeTableItem.tsx
   - Renders details for a single schedule entry (group, teacher, room, time, meeting link).

Data Flow:
- Use time-table.service.ts to fetch schedules from the backend.
- Filter data in the main component based on selected filters.
- Pass filtered data to the view components.

State Management:
- Local state in TimeTable.tsx for:
  - View mode (daily/weekly)
  - Selected date
  - Selected group/class/teacher

Steps to Implement:
1. Create Filter Component (TimeTableFilters.tsx)
   - Group, class, teacher, date pickers.
2. Create Weekly View Component (TimeTableWeeklyView.tsx)
   - Render a 7-day grid, map schedule entries to correct slots.
3. Create Daily View Component (TimeTableDailyView.tsx)
   - Render a list/grid for one day, show all schedule entries.
4. Create Item Component (TimeTableItem.tsx)
   - Show schedule details.
5. Integrate in Main Page (TimeTable.tsx)
   - Fetch data, manage state, render filters and correct view.

File Placement:
- src/components/features/schedule/TimeTableFilters.tsx
- src/components/features/schedule/TimeTableWeeklyView.tsx
- src/components/features/schedule/TimeTableDailyView.tsx
- src/components/features/schedule/TimeTableItem.tsx
- src/pages/TimeTable.tsx (main page)
*/

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTimeTable } from "@/hooks/useTimeTable";
import { cn } from "@/lib/utils";
import type { Schedule } from "@/types/api.types";
import { addDays, endOfWeek, format, startOfWeek, subDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useState } from "react";
import TimeTableDailyView from "../components/features/schedule/TimeTableDailyView";
import TimeTableEventModal from "../components/features/schedule/TimeTableEventModal";
import TimeTableFilters from "../components/features/schedule/TimeTableFilters";
import TimeTableWeeklyView from "../components/features/schedule/TimeTableWeeklyView";

interface Filters {
  group?: string;
  teacher?: string;
  room?: string;
}

const TimeTable = () => {
  const [viewMode, setViewMode] = useState<"weekly" | "daily">("weekly");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filters, setFilters] = useState<Filters>({
    group: undefined,
    teacher: undefined,
    room: undefined,
  });
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Schedule | undefined>();

  const { schedules, loading, handleCreateSchedule, handleUpdateSchedule } =
    useTimeTable();

  // Filter schedules based on filters and selectedDate
  const filteredSchedules = schedules.filter((schedule) => {
    if (!schedule.start_time) return false;
    const scheduleDate = new Date(schedule.start_time);

    // Date filter
    let dateMatch = false;
    if (viewMode === "daily") {
      dateMatch = scheduleDate.toDateString() === selectedDate.toDateString();
    } else {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      dateMatch = scheduleDate >= weekStart && scheduleDate <= weekEnd;
    }

    // Other filters
    const groupMatch =
      !filters.group || schedule.group_id?.toString() === filters.group;
    const teacherMatch =
      !filters.teacher || schedule.teacher?.id?.toString() === filters.teacher;
    const roomMatch =
      !filters.room || schedule.room?.id?.toString() === filters.room;

    return dateMatch && groupMatch && teacherMatch && roomMatch;
  });

  const handlePrevious = () => {
    setSelectedDate((prev) =>
      viewMode === "daily" ? subDays(prev, 1) : subDays(prev, 7)
    );
  };

  const handleNext = () => {
    setSelectedDate((prev) =>
      viewMode === "daily" ? addDays(prev, 1) : addDays(prev, 7)
    );
  };

  const handleEventClick = (event: Schedule) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleEventSubmit = async (data: any) => {
    const formattedData = {
      ...data,
      start_time: new Date(
        data.date.getFullYear(),
        data.date.getMonth(),
        data.date.getDate(),
        ...data.start_time.split(":").map(Number)
      ).toISOString(),
      end_time: new Date(
        data.date.getFullYear(),
        data.date.getMonth(),
        data.date.getDate(),
        ...data.end_time.split(":").map(Number)
      ).toISOString(),
    };

    if (selectedEvent?.id) {
      await handleUpdateSchedule(selectedEvent.id, formattedData);
    } else {
      await handleCreateSchedule(formattedData);
    }

    setSelectedEvent(undefined);
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      group: undefined,
      teacher: undefined,
      room: undefined,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Filters sidebar */}
        <div className="col-span-3">
          <TimeTableFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Main content */}
        <div className="col-span-9">
          <div className="flex flex-col space-y-4">
            {/* Header with navigation */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Timetable</h1>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedEvent(undefined);
                    setIsEventModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode("daily")}
                    className={cn(
                      viewMode === "daily" &&
                        "bg-primary text-primary-foreground"
                    )}
                  >
                    Daily
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode("weekly")}
                    className={cn(
                      viewMode === "weekly" &&
                        "bg-primary text-primary-foreground"
                    )}
                  >
                    Weekly
                  </Button>
                </div>
              </div>
            </div>

            {/* Date navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="min-w-[240px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {viewMode === "daily"
                        ? format(selectedDate, "PPP")
                        : `${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "PPP")} - ${format(endOfWeek(selectedDate, { weekStartsOn: 1 }), "PPP")}`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="icon" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Main timetable view */}
            <div className="bg-white rounded-lg shadow">
              {loading ? (
                <div className="p-8 text-center">Loading...</div>
              ) : viewMode === "weekly" ? (
                <TimeTableWeeklyView
                  schedules={filteredSchedules}
                  selectedDate={selectedDate}
                  onEventClick={handleEventClick}
                />
              ) : (
                <TimeTableDailyView
                  schedules={filteredSchedules}
                  selectedDate={selectedDate}
                  onEventClick={handleEventClick}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <TimeTableEventModal
        open={isEventModalOpen}
        onOpenChange={setIsEventModalOpen}
        event={selectedEvent}
        onSubmit={handleEventSubmit}
      />
    </div>
  );
};

export default TimeTable;
