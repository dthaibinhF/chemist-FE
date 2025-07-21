import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Clock, MapPin, Users, Video } from "lucide-react";
import type { Schedule } from "../../../types/api.types";

interface TimeTableEventCardProps {
  schedule: Schedule;
  onClick?: () => void;
}

const TimeTableEventCard = ({ schedule, onClick }: TimeTableEventCardProps) => {
  const getEventColor = (groupName: string) => {
    // Simple hash function to generate consistent colors
    const hash = groupName.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 95%)`;
  };

  const backgroundColor = schedule.group_name
    ? getEventColor(schedule.group_name)
    : "bg-blue-100";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "rounded-lg shadow p-2 mb-1 cursor-pointer hover:shadow-md transition-all",
              "border border-transparent hover:border-primary/20"
            )}
            style={{ backgroundColor }}
            onClick={onClick}
          >
            <div className="font-medium truncate text-sm">
              {schedule.group_name}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3 mr-1" />
              <span>
                {schedule.start_time &&
                  format(new Date(schedule.start_time), "HH:mm")}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="p-3 max-w-[300px]">
          <div className="space-y-2">
            <h4 className="font-medium">{schedule.group_name}</h4>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              <span>
                {schedule.start_time &&
                  format(new Date(schedule.start_time), "HH:mm")}{" "}
                -{" "}
                {schedule.end_time &&
                  format(new Date(schedule.end_time), "HH:mm")}
              </span>
            </div>
            {schedule.teacher?.account?.name && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                <span>{schedule.teacher.account.name}</span>
              </div>
            )}
            {schedule.room?.name && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{schedule.room.name}</span>
              </div>
            )}
            {schedule.meeting_link && (
              <div className="flex items-center text-sm">
                <Video className="h-4 w-4 mr-2 text-blue-500" />
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
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TimeTableEventCard;
