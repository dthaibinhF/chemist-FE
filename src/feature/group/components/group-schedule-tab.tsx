import React, { useEffect, useMemo, useState } from 'react';

import { RoleBasedAccess } from '@/components/auth/RoleBasedAccess';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WeeklyCalendar } from '@/feature/timetable/components/weekly-calendar';
import { useTimetable } from '@/feature/timetable/hooks/useTimetable';
import type { CalendarEvent } from '@/feature/timetable/types/timetable.types';
import type { Schedule } from '@/types/api.types';
import { PERMISSIONS } from '@/utils/rbac-utils';

interface GroupScheduleTabProps {
  groupId: number;
  groupName: string;
}

const scheduleToCalendarEvent = (schedule: Schedule): CalendarEvent => {
  return {
    id: schedule.id || 0,
    title: schedule.group_name,
    start: new Date(schedule.start_time),
    end: new Date(schedule.end_time),
    group_name: schedule.group_name,
    teacher_name: schedule.teacher_name,
    room_name: schedule.room?.name || 'Chưa xác định',
    delivery_mode: schedule.delivery_mode,
    meeting_link: schedule.meeting_link,
    color: 'bg-blue-100 text-blue-900',
    textColor: 'text-blue-900',
  };
};

export const GroupScheduleTab: React.FC<GroupScheduleTabProps> = ({ groupId, groupName }) => {
  const { schedules, loading, handleFetchFilteredSchedules, getSchedulesByGroup } = useTimetable();

  const [selectedWeek, setSelectedWeek] = useState(new Date());

  useEffect(() => {
    if (groupId) {
      handleFetchFilteredSchedules({ group_id: groupId });
    }
  }, [groupId, handleFetchFilteredSchedules]);

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const groupSchedulesList = getSchedulesByGroup(groupId);
    return groupSchedulesList.map(scheduleToCalendarEvent);
  }, [schedules, groupId, getSchedulesByGroup]);

  const handleEventClick = (event: CalendarEvent) => {
    console.log('Schedule event clicked:', event);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải lịch học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Lịch học nhóm {groupName}</h3>
          <p className="text-sm text-muted-foreground">Xem lịch học hàng tuần của nhóm</p>
        </div>

        <RoleBasedAccess allowedRoles={PERMISSIONS.MANAGE_SCHEDULES}>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Thêm lịch học
            </Button>
          </div>
        </RoleBasedAccess>
      </div>

      <Card>
        <CardContent className="p-6">
          {calendarEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <svg
                  className="w-12 h-12 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Chưa có lịch học</h3>
              <p className="text-muted-foreground mb-4">Nhóm này chưa có lịch học nào được tạo.</p>
              <RoleBasedAccess allowedRoles={PERMISSIONS.MANAGE_SCHEDULES}>
                <Button variant="default">Tạo lịch học</Button>
              </RoleBasedAccess>
            </div>
          ) : (
            <WeeklyCalendar
              events={calendarEvents}
              selectedWeek={selectedWeek}
              onWeekChange={setSelectedWeek}
              onEventClick={handleEventClick}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};