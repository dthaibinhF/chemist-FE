import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Calendar, CalendarDays, CalendarCheck } from "lucide-react";

import { useTimetable } from "../hooks/useTimetable";
import { WeeklyCalendar } from "./weekly-calendar";
import { DailyCalendar } from "./daily-calendar";
import { CreateScheduleDialog } from "./create-schedule-dialog";
import { EditScheduleDialog } from "./edit-schedule-dialog";
import { TimetableFilters } from "./timetable-filters";
import { GenerateWeeklyScheduleDialog } from "./generate-weekly-schedule-dialog";
import { convertScheduleToEvent, getWeekStart } from "../utils/calendar-utils";
import type { CalendarEvent } from "../types/timetable.types";
import { format } from "date-fns";

interface TimetableViewProps {
  className?: string;
}

export const TimetableView: React.FC<TimetableViewProps> = ({ className }) => {
  const {
    schedules,
    loading,
    error,
    viewMode,
    selectedDate,
    filters,
    searchQuery,
    handleFetchSchedules,
    handleFetchFilteredSchedules,
    handleSearchSchedules,
    handleSetViewMode,
    handleSetSelectedDate,
    handleSetFilters,
    handleSetSearchQuery,
    handleGenerateWeeklySchedule,
  } = useTimetable();


  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [generateWeeklyDialogOpen, setGenerateWeeklyDialogOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);

  // Convert schedules to calendar events
  const events: CalendarEvent[] = useMemo(
    () => schedules.map(convertScheduleToEvent),
    [schedules]
  );

  // Load schedules on component mount
  useEffect(() => {
    handleFetchSchedules();
  }, [handleFetchSchedules]);

  // Handle filters and search
  const handleFiltersChange = async (newFilters: typeof filters) => {
    handleSetFilters(newFilters);

    // Apply filters if any are set
    if (Object.values(newFilters).some(Boolean)) {
      await handleFetchFilteredSchedules(newFilters);
    } else {
      // If no filters, load all schedules
      await handleFetchSchedules();
    }
  };

  const handleSearchChange = async (query: string) => {
    handleSetSearchQuery(query);

    // Apply search if query exists
    if (query.trim()) {
      await handleSearchSchedules({ search: query });
    } else {
      // If no search query and no filters, load all schedules
      if (!Object.values(filters).some(Boolean)) {
        await handleFetchSchedules();
      } else {
        // If search is cleared but filters exist, apply filters
        await handleFetchFilteredSchedules(filters);
      }
    }
  };

  // Handle view mode changes
  const handleTabChange = (value: string) => {
    handleSetViewMode(value as "weekly" | "daily");
  };

  // Handle date changes
  const handleDateChange = (date: Date) => {
    handleSetSelectedDate(date);
  };

  // Handle week changes for weekly view
  const handleWeekChange = (weekStart: Date) => {
    handleSetSelectedDate(weekStart);
  };

  // Handle event clicks
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedScheduleId(event.id);
    setEditDialogOpen(true);
  };

  // Handle weekly schedule generation
  const handleWeeklyGeneration = async (data: {
    group_id: number;
    start_date: Date;
    end_date: Date;
  }) => {
    try {
      // Format dates to start/end of day for OffsetDateTime compatibility
      const startDate = new Date(data.start_date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(data.end_date);
      endDate.setHours(23, 59, 59, 999);

      console.log('startDate', startDate.toISOString());
      console.log('endDate', endDate.toISOString());

      await handleGenerateWeeklySchedule(
        data.group_id,
        startDate.toISOString(),
        endDate.toISOString()
      );
      // Refresh schedules after generation
      handleFetchSchedules();
    } catch (error) {
      console.error("Lỗi khi tạo lịch học tuần:", error);
    }
  };

  // Handle event edit (for future use)
  // const handleEventEdit = (event: CalendarEvent) => {
  //   setSelectedScheduleId(event.id);
  //   setEditDialogOpen(true);
  // };

  // Handle event delete (for future use)
  // const handleEventDelete = async (event: CalendarEvent) => {
  //   if (confirm(`Bạn có chắc chắn muốn xóa lịch học "${event.group_name}"?`)) {
  //     try {
  //       await handleDeleteSchedule(event.id);
  //     } catch (error) {
  //       console.error("Lỗi khi xóa lịch học:", error);
  //     }
  //   }
  // };

  // Calculate current week start for weekly view
  const currentWeekStart = useMemo(
    () => getWeekStart(selectedDate),
    [selectedDate]
  );

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="text-red-600 mb-2">Có lỗi xảy ra khi tải dữ liệu</div>
          <div className="text-sm text-gray-500 mb-4">{error}</div>
          <Button onClick={handleFetchSchedules} variant="outline">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch học</h1>
          <p className="text-gray-600 mt-1">
            Quản lý và xem lịch học của các nhóm
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setGenerateWeeklyDialogOpen(true)}
          >
            <CalendarCheck className="w-4 h-4 mr-2" />
            Tạo lịch tuần
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo lịch học
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TimetableFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        className="mb-6"
      />

      {/* View Mode Tabs */}
      <Tabs
        value={viewMode}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="weekly" className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-2" />
            Tuần
          </TabsTrigger>
          <TabsTrigger value="daily" className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Ngày
          </TabsTrigger>
        </TabsList>

        {/* Weekly View */}
        <TabsContent value="weekly" className="space-y-4">
          <WeeklyCalendar
            events={events}
            selectedWeek={currentWeekStart}
            onWeekChange={handleWeekChange}
            onEventClick={handleEventClick}
            loading={loading}
          />
        </TabsContent>

        {/* Daily View */}
        <TabsContent value="daily" className="space-y-4">
          <DailyCalendar
            events={events.filter(event => {
              // Use Vietnam timezone for date comparison
              const eventDateVN = format(event.start, 'yyyy-MM-dd');
              const selectedDateVN = format(new Date(selectedDate), 'yyyy-MM-dd');
              return eventDateVN === selectedDateVN;
            })}
            selectedDate={new Date(selectedDate)}
            onDateChange={handleDateChange}
            onEventClick={handleEventClick}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateScheduleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditScheduleDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        scheduleId={selectedScheduleId}
      />

      <GenerateWeeklyScheduleDialog
        open={generateWeeklyDialogOpen}
        onOpenChange={setGenerateWeeklyDialogOpen}
        onGenerate={handleWeeklyGeneration}
        loading={loading}
      />

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <Card className="mt-8">
          <CardContent className="p-12 text-center">
            <CalendarDays className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có lịch học nào
            </h3>
            <p className="text-gray-500 mb-6">
              Bắt đầu bằng cách tạo lịch học đầu tiên cho các nhóm của bạn.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo lịch học đầu tiên
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};