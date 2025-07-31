import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Calendar, CalendarDays, CalendarCheck, Users } from "lucide-react";

import { useTimetable } from "../hooks/useTimetable";
import { WeeklyCalendar } from "./weekly-calendar";
import { DailyCalendar } from "./daily-calendar";
import { CreateScheduleDialog } from "./create-schedule-dialog";
import { EditScheduleDialog } from "./edit-schedule-dialog";
import { TimetableFilters } from "./timetable-filters";
import { GenerateWeeklyScheduleDialog } from "./generate-weekly-schedule-dialog";
import { BulkScheduleGenerationDialog } from "./bulk-schedule-generation-dialog";
import { convertScheduleToEvent, getWeekStart } from "../utils/calendar-utils";
import type { CalendarEvent } from "../types/timetable.types";
import { format } from "date-fns";
import { toast } from "sonner";

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
    handleClearSchedule,
  } = useTimetable();



  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [generateWeeklyDialogOpen, setGenerateWeeklyDialogOpen] = useState(false);
  const [bulkGenerationDialogOpen, setBulkGenerationDialogOpen] = useState(false);
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
  const handleEventClick = useCallback((event: CalendarEvent) => {
    console.log('Event clicked:', event.id, event.group_name);

    // If dialog is already open with a different schedule, close it first
    if (editDialogOpen && selectedScheduleId !== event.id) {
      setEditDialogOpen(false);
      // Wait for dialog to close before opening new one
      setTimeout(() => {
        handleClearSchedule();
        setSelectedScheduleId(event.id);
        setEditDialogOpen(true);
      }, 100);
      return;
    }

    // Clear any existing schedule data before setting new ID
    handleClearSchedule();
    setSelectedScheduleId(event.id);
    setEditDialogOpen(true);
  }, [editDialogOpen, selectedScheduleId, handleClearSchedule]);

  // Handle weekly schedule generation
  const handleWeeklyGeneration = async (data: {
    group_id: number;
    start_date: Date;
    end_date: Date;
  }) => {
    try {
      // Format dates as YYYY-MM-DD for LocalDate backend compatibility
      const formatDateForApi = (date: Date): string => {
        return format(date, 'yyyy-MM-dd');
      };

      await handleGenerateWeeklySchedule(
        data.group_id,
        formatDateForApi(data.start_date),
        formatDateForApi(data.end_date)
      );
      // Refresh schedules after generation
      handleFetchSchedules();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // Handle bulk schedule generation success
  const handleBulkGenerationSuccess = useCallback((generatedCount: number) => {
    // Refresh schedules to show the newly generated ones
    handleFetchSchedules();
    toast.success(`Đã tạo thành công ${generatedCount} lịch học`);
  }, [handleFetchSchedules]);

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
            onClick={() => setBulkGenerationDialogOpen(true)}
          >
            <Users className="w-4 h-4 mr-2" />
            Tạo hàng loạt
          </Button>
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

      <BulkScheduleGenerationDialog
        open={bulkGenerationDialogOpen}
        onOpenChange={setBulkGenerationDialogOpen}
        onSuccess={handleBulkGenerationSuccess}
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