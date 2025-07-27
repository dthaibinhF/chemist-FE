import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, MapPin, Users, Video } from "lucide-react";
import type { Schedule } from "../../../types/api.types";
import { displayTimeRange } from "@/utils/date-formatters";
import { utcToVietnamTime } from "@/utils/timezone-utils";

interface TimeTableDailyViewProps {
  schedules: Schedule[];
  selectedDate: Date;
  onEventClick: (event: Schedule) => void;
}

const TimeTableDailyView = ({
  schedules,
  onEventClick,
}: TimeTableDailyViewProps) => {
  // Sort schedules by start time (convert to Vietnam time for proper sorting)
  const sortedSchedules = [...schedules].sort((a, b) => {
    const aTime = a.start_time ? utcToVietnamTime(a.start_time).getTime() : 0;
    const bTime = b.start_time ? utcToVietnamTime(b.start_time).getTime() : 0;
    return aTime - bTime;
  });

  return (
    <div className="p-4">
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-4">
          {sortedSchedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No events scheduled for this day
            </div>
          ) : (
            sortedSchedules.map((schedule) => (
              <Card
                key={schedule.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onEventClick(schedule)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium text-lg">
                      {schedule.group_name}
                    </h3>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>
                        {schedule.start_time && schedule.end_time &&
                          displayTimeRange(schedule.start_time, schedule.end_time)}
                      </span>
                    </div>
                    {schedule.teacher_name && (
                      <div className="flex items-center text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        <span>{schedule.teacher_name}</span>
                      </div>
                    )}
                    {schedule.room?.name && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>{schedule.room.name}</span>
                      </div>
                    )}
                    {schedule.meeting_link && (
                      <div className="flex items-center">
                        <Video className="mr-2 h-4 w-4 text-blue-500" />
                        <a
                          href={schedule.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TimeTableDailyView;
