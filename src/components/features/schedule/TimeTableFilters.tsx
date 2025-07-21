import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoom } from "@/hooks/useRoom";
import { useTimeTable } from "@/hooks/useTimeTable";
import type { Room, Teacher } from "@/types/api.types";
import { Filter, X } from "lucide-react";
import { useEffect } from "react";
import GroupSelect from "../group-select";

interface TimeTableFiltersProps {
  filters: {
    group?: string;
    teacher?: string;
    room?: string;
  };
  onFilterChange: (filters: {
    group?: string;
    teacher?: string;
    room?: string;
  }) => void;
  onClearFilters: () => void;
}

const TimeTableFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
}: TimeTableFiltersProps) => {
  const { schedules } = useTimeTable();
  const { rooms, handleFetchRooms } = useRoom();

  useEffect(() => {
    handleFetchRooms();
  }, [handleFetchRooms]);

  // Get unique teachers from schedules
  const teachers = schedules
    ?.map((schedule) => schedule.teacher)
    .filter(
      (teacher, index, self) =>
        teacher && self.findIndex((t) => t?.id === teacher.id) === index
    ) as Teacher[];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          <h3 className="font-medium">Filters</h3>
        </div>
        {(filters.group || filters.teacher || filters.room) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Group</label>
          <GroupSelect
            value={filters.group}
            handleSelect={(value) =>
              onFilterChange({ ...filters, group: value })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Teacher</label>
          <Select
            value={filters.teacher}
            onValueChange={(value) =>
              onFilterChange({ ...filters, teacher: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers?.map((teacher) => (
                <SelectItem
                  key={teacher.id}
                  value={teacher.id?.toString() || ""}
                >
                  {teacher.account?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Room</label>
          <Select
            value={filters.room}
            onValueChange={(value) =>
              onFilterChange({ ...filters, room: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a room" />
            </SelectTrigger>
            <SelectContent>
              {rooms?.map((room: Room) => (
                <SelectItem key={room.id} value={room.id?.toString() || ""}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};

export default TimeTableFilters;
