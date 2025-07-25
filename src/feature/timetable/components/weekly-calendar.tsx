import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar, MapPin, User, Clock } from "lucide-react";

import type { CalendarEvent, WeekData } from "../types/timetable.types";
import {
  generateWeekData,
  formatDate,
  formatTime,
  isToday,
  getWeekRange,
  navigateWeek,
  goToToday,
  isEventActive,
  getEventDuration
} from "../utils/calendar-utils";

interface WeeklyCalendarProps {
  events: CalendarEvent[];
  selectedWeek: Date;
  onWeekChange: (week: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  loading?: boolean;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  events,
  selectedWeek,
  onWeekChange,
  onEventClick,
  loading = false,
}) => {
  // console.log(events);

  const weekData: WeekData = useMemo(
    () => generateWeekData(selectedWeek, events),
    [selectedWeek, events]
  );
  console.log('weekData:', weekData);

  const handlePrevWeek = () => {
    onWeekChange(navigateWeek(selectedWeek, 'prev'));
  };

  const handleNextWeek = () => {
    onWeekChange(navigateWeek(selectedWeek, 'next'));
  };

  const handleToday = () => {
    onWeekChange(goToToday());
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-8 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-8 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Card key={i} className="h-96">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-16 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {getWeekRange(selectedWeek)}
        </h2>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleToday} size="sm">
            <Calendar className="w-4 h-4 mr-1" />
            Hôm nay
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrevWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekData.days.map(({ date, events: dayEvents }, index) => {
          return <Card
            key={index}
            className={`min-h-[400px] ${isToday(date) ? 'ring-2 ring-blue-500' : ''}`}
          >
            <CardContent className="p-3">
              {/* Day Header */}
              <div className={`text-center mb-3 pb-2 border-b ${isToday(date) ? 'text-blue-600 font-semibold' : 'text-gray-600'
                }`}>
                <div className="text-sm font-medium">
                  {formatDate(date)}
                </div>
                {isToday(date) && (
                  <div className="text-xs text-blue-500 font-semibold mt-1">
                    Hôm nay
                  </div>
                )}
              </div>


              {/* Events */}
              <div className="space-y-2">
                {dayEvents.length === 0 ? (
                  <div className="text-center text-gray-400 text-xs py-8">
                    Không có lịch học
                  </div>
                ) : (
                  dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-2 rounded-md cursor-pointer transition-all hover:shadow-md ${event.color
                        } ${isEventActive(event) ? 'ring-2 ring-green-400 shadow-lg' : ''
                        }`}
                      onClick={() => handleEventClick(event)}
                    >
                      {/* Event Title */}
                      <div className="font-medium text-sm truncate mb-1">
                        {event.group_name}
                      </div>

                      {/* Event Time */}
                      <div className="flex items-center text-xs mb-1">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>
                          {formatTime(event.start)} - {formatTime(event.end)}
                        </span>
                        <span className="ml-auto text-xs opacity-75">
                          ({getEventDuration(event)})
                        </span>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <User className="w-3 h-3 mr-1" />
                          <span className="truncate">{event.teacher_name}</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{event.room_name}</span>
                        </div>
                      </div>

                      {/* Delivery Mode Indicator */}
                      <div className="mt-1 text-right">
                        <span className={`text-xs px-1 py-0.5 rounded ${event.delivery_mode === 'ONLINE'
                          ? 'bg-green-100 text-green-800'
                          : event.delivery_mode === 'HYBRID'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {event.delivery_mode === 'ONLINE' ? 'Online' :
                            event.delivery_mode === 'HYBRID' ? 'Hybrid' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        })}
      </div>
    </div>
  );
};