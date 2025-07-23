import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar, MapPin, User, Clock, Video, ExternalLink } from "lucide-react";

import type { CalendarEvent, TimeSlot } from "../types/timetable.types";
import { 
  generateTimeSlots, 
  formatDateFull, 
  formatTime, 
  isToday, 
  isEventActive,
  getEventDuration
} from "../utils/calendar-utils";

interface DailyCalendarProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  loading?: boolean;
}

export const DailyCalendar: React.FC<DailyCalendarProps> = ({
  events,
  selectedDate,
  onDateChange,
  onEventClick,
  loading = false,
}) => {
  const timeSlots: TimeSlot[] = useMemo(
    () => generateTimeSlots(events),
    [events]
  );

  const handlePrevDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    onDateChange(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const handleMeetingLinkClick = (e: React.MouseEvent, link: string) => {
    e.stopPropagation();
    window.open(link, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-80 animate-pulse" />
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-8 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-8 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-16">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {formatDateFull(selectedDate)}
          {isToday(selectedDate) && (
            <span className="ml-2 text-sm text-blue-600 font-normal">
              (Hôm nay)
            </span>
          )}
        </h2>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleToday} size="sm">
            <Calendar className="w-4 h-4 mr-1" />
            Hôm nay
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrevDay}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextDay}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Daily Schedule */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {timeSlots.map((slot) => (
          <Card key={slot.time} className="relative">
            <CardContent className="p-4">
              <div className="flex">
                {/* Time Column */}
                <div className="w-16 flex-shrink-0 text-sm font-medium text-gray-500 pt-1">
                  {slot.time}
                </div>

                {/* Events Column */}
                <div className="flex-1 ml-4">
                  {slot.events.length === 0 ? (
                    <div className="text-gray-300 text-sm italic py-2">
                      Không có lịch học
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {slot.events.map((event) => (
                        <div
                          key={event.id}
                          className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            event.color
                          } ${
                            isEventActive(event) ? 'ring-2 ring-green-400 shadow-lg' : ''
                          }`}
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {event.group_name}
                              </h3>
                              <div className="flex items-center text-sm mt-1">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>
                                  {formatTime(event.start)} - {formatTime(event.end)}
                                </span>
                                <span className="ml-2 text-sm opacity-75">
                                  ({getEventDuration(event)})
                                </span>
                              </div>
                            </div>

                            {/* Delivery Mode and Active Indicator */}
                            <div className="flex items-center space-x-2">
                              {isEventActive(event) && (
                                <span className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                                  Đang diễn ra
                                </span>
                              )}
                              <span className={`text-sm px-2 py-1 rounded ${
                                event.delivery_mode === 'ONLINE' 
                                  ? 'bg-green-100 text-green-800' 
                                  : event.delivery_mode === 'HYBRID'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {event.delivery_mode === 'ONLINE' ? 'Trực tuyến' : 
                                 event.delivery_mode === 'HYBRID' ? 'Kết hợp' : 'Trực tiếp'}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm">
                                <User className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="font-medium">Giáo viên:</span>
                                <span className="ml-1">{event.teacher_name}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="font-medium">Phòng học:</span>
                                <span className="ml-1">{event.room_name}</span>
                              </div>
                            </div>

                            {/* Meeting Link */}
                            {event.meeting_link && (
                              <div className="flex items-center justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => handleMeetingLinkClick(e, event.meeting_link!)}
                                  className="flex items-center"
                                >
                                  <Video className="w-4 h-4 mr-1" />
                                  Tham gia meeting
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      {events.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Tóm tắt ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {events.length}
                </div>
                <div className="text-sm text-gray-500">Buổi học</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {events.filter(e => e.delivery_mode === 'ONLINE').length}
                </div>
                <div className="text-sm text-gray-500">Trực tuyến</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {events.filter(e => e.delivery_mode === 'OFFLINE').length}
                </div>
                <div className="text-sm text-gray-500">Trực tiếp</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {events.filter(e => isEventActive(e)).length}
                </div>
                <div className="text-sm text-gray-500">Đang diễn ra</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};