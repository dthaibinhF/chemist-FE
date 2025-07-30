import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { groupService } from "@/service/group.service";
import type { Group } from "@/types/api.types";

// Schema for weekly schedule generation
const generateWeeklyScheduleSchema = z.object({
  group_id: z.number().min(1, "Vui lòng chọn nhóm học"),
  date_range: z.object({
    from: z.date({ required_error: "Vui lòng chọn ngày bắt đầu" }),
    to: z.date({ required_error: "Vui lòng chọn ngày kết thúc" }),
  }).refine((data) => data.to >= data.from, {
    message: "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu",
    path: ["to"],
  }),
});

type GenerateWeeklyScheduleData = z.infer<typeof generateWeeklyScheduleSchema>;

interface GenerateWeeklyScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (data: {
    group_id: number;
    start_date: Date;
    end_date: Date;
  }) => Promise<void>;
  loading?: boolean;
}

export const GenerateWeeklyScheduleDialog: React.FC<GenerateWeeklyScheduleDialogProps> = ({
  open,
  onOpenChange,
  onGenerate,
  loading = false,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const form = useForm<GenerateWeeklyScheduleData>({
    resolver: zodResolver(generateWeeklyScheduleSchema),
    defaultValues: {
      group_id: 0,
      date_range: {
        from: new Date(),
        to: (() => {
          const date = new Date();
          date.setDate(date.getDate() + 6); // Default to one week
          return date;
        })(),
      },
    },
  });

  // Load groups on component mount
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const groupsData = await groupService.getAllGroups();
        setGroups(groupsData);
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhóm:", error);
      } finally {
        setLoadingGroups(false);
      }
    };

    if (open) {
      loadGroups();
    }
  }, [open]);

  const handleSubmit = async (data: GenerateWeeklyScheduleData) => {
    try {
      await onGenerate({
        group_id: data.group_id,
        start_date: data.date_range.from,
        end_date: data.date_range.to,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Lỗi khi tạo lịch học tuần:", error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const formatDateDisplay = (date: Date | undefined): string => {
    if (!date) return "Chọn ngày";
    return format(date, "dd/MM/yyyy", { locale: vi });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo lịch học tuần</DialogTitle>
          <DialogDescription>
            Tạo lịch học tuần dựa trên lịch trình template của nhóm trong khoảng thời gian đã chọn.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Group Selection */}
            <FormField
              control={form.control}
              name="group_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Nhóm học</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                    disabled={loadingGroups}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full h-11">
                        <SelectValue
                          placeholder={loadingGroups ? "Đang tải..." : "Chọn nhóm học"}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id?.toString() || ""}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Range */}
            <FormField
              control={form.control}
              name="date_range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Khoảng thời gian</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-11 justify-start text-left font-normal",
                            !field.value?.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value?.from ? (
                            field.value.to ? (
                              `${formatDateDisplay(field.value.from)} - ${formatDateDisplay(field.value.to)}`
                            ) : (
                              formatDateDisplay(field.value.from)
                            )
                          ) : (
                            "Chọn khoảng thời gian"
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="range"
                        defaultMonth={field.value?.from}
                        selected={field.value}
                        onSelect={field.onChange}
                        numberOfMonths={2}
                      // disabled={(date) =>
                      //   date < new Date(new Date().setHours(0, 0, 0, 0))
                      // }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Lưu ý:</strong> Tính năng này sẽ tự động tạo lịch học cho nhóm được chọn
                dựa trên lịch trình template của nhóm trong khoảng thời gian đã chọn.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} className="min-w-[80px]">
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={loading || loadingGroups}
                className="min-w-[120px]"
              >
                {loading ? "Đang tạo..." : "Tạo lịch học"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};