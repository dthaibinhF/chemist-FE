import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RoomSelect from "@/components/features/room-select";
import { useTimeTable } from "@/hooks/useTimeTable";
import { cn } from "@/lib/utils";
import type { Schedule, Teacher } from "@/types/api.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { utcToVietnamTime, formatUtcToVietnamTime, getCurrentVietnamTime } from "@/utils/timezone-utils";
import { useForm } from "react-hook-form";
import * as z from "zod";
import GroupSelect from "../group-select";

const formSchema = z.object({
  group_id: z.number(),
  date: z.date({
    required_error: "Date is required",
  }),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  delivery_mode: z.string(),
  meeting_link: z.string().url().optional().or(z.literal("")),
  teacher: z.object({
    id: z.number(),
  }),
  room: z.object({
    id: z.number(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface TimeTableEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Schedule;
  onSubmit: (data: FormValues) => void;
}

const TimeTableEventModal = ({
  open,
  onOpenChange,
  event,
  onSubmit,
}: TimeTableEventModalProps) => {
  const { schedules } = useTimeTable();

  // Get unique teachers from schedules - using teacher_id and teacher_name
  const teachers = schedules
    ?.filter(schedule => schedule.teacher_id && schedule.teacher_name)
    .reduce((acc, schedule) => {
      const existingTeacher = acc.find(t => t.id === schedule.teacher_id);
      if (!existingTeacher) {
        acc.push({
          id: schedule.teacher_id,
          account: { name: schedule.teacher_name },
        } as Teacher);
      }
      return acc;
    }, [] as Teacher[]) || [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      group_id: event?.group_id ? Number(event.group_id) : 0,
      date: event?.start_time ? utcToVietnamTime(event.start_time) : getCurrentVietnamTime(),
      start_time: event?.start_time
        ? formatUtcToVietnamTime(event.start_time, "HH:mm")
        : "",
      end_time: event?.end_time
        ? formatUtcToVietnamTime(event.end_time, "HH:mm")
        : "",
      delivery_mode: event?.delivery_mode || "OFFLINE",
      meeting_link: event?.meeting_link || "",
      teacher: {
        id: event?.teacher_id ? Number(event.teacher_id) : 0,
      },
      room: {
        id: event?.room?.id ? Number(event.room.id) : 0,
      },
    },
  });

  const handleSubmit = form.handleSubmit((values: FormValues) => {
    onSubmit(values);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create New Event"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="form-schedule"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="group_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group</FormLabel>
                  <GroupSelect
                    value={field.value?.toString()}
                    handleSelect={(value) => field.onChange(Number(value))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input type="time" {...field} className="w-full" />
                        <Clock className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input type="time" {...field} className="w-full" />
                        <Clock className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="room.id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room</FormLabel>
                  <FormControl>
                    <RoomSelect
                      handleSelect={(value) => field.onChange(value)}
                      value={field.value}
                      placeholder="Select a room"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacher.id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meeting_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Link (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://meet.google.com/..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {event ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TimeTableEventModal;
