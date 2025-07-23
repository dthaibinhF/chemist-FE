import type { Schedule } from "../../../types/api.types";
import TimeTableEventCard from "./TimeTableEventCard";
import { utcToVietnamTime } from "@/utils/timezone-utils";

interface TimeTableWeeklyViewProps {
  schedules: Schedule[];
  selectedDate: Date;
  onEventClick: (event: Schedule) => void;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const TIME_SLOTS = Array.from(
  { length: 11 },
  (_, i) => `${(8 + i).toString().padStart(2, "0")}:00`
); // 08:00-18:00

const getDayOfWeek = (date: Date) => {
  // 0 (Sun) -> 6, 1 (Mon) -> 0, ...
  const jsDay = date.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
};

const isSameTimeSlot = (date: Date, slot: string) => {
  const hour = date.getHours();
  return slot.startsWith(hour.toString().padStart(2, "0"));
};

const TimeTableWeeklyView = ({
  schedules,
  selectedDate,
  onEventClick,
}: TimeTableWeeklyViewProps) => {
  // Group schedules by day and time slot
  const grid: { [day: number]: { [slot: string]: Schedule[] } } = {};
  for (let d = 0; d < 7; d++) grid[d] = {};
  for (const slot of TIME_SLOTS) for (let d = 0; d < 7; d++) grid[d][slot] = [];

  schedules.forEach((s) => {
    if (!s.start_time) return;
    // Convert UTC time to Vietnam time for proper day/time slot placement
    const start = utcToVietnamTime(s.start_time);
    const day = getDayOfWeek(start);
    const slot = TIME_SLOTS.find((ts) => isSameTimeSlot(start, ts));
    if (slot) grid[day][slot].push(s);
  });

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Weekly Timetable View</h2>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 min-w-[900px] border rounded-lg">
          {/* Header row */}
          <div className="bg-gray-100 p-2 font-semibold border-b border-r">
            Time
          </div>
          {DAYS.map((day) => (
            <div
              key={day}
              className="bg-gray-100 p-2 font-semibold border-b border-r text-center"
            >
              {day}
            </div>
          ))}
          {/* Time slots and events */}
          {TIME_SLOTS.map((slot) => (
            <div key={slot}>
              <div
                key={slot}
                className="border-b border-r p-2 text-xs font-semibold bg-gray-50"
              >
                {slot}
              </div>
              {DAYS.map((_, d) => (
                <div
                  key={d + slot}
                  className="border-b border-r align-top min-h-[60px] p-1"
                >
                  {grid[d][slot].map((s) => (
                    <TimeTableEventCard
                      key={s.id}
                      schedule={s}
                      onClick={() => onEventClick(s)}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeTableWeeklyView;
