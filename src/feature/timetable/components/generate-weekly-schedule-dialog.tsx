import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { groupService } from "@/service/group.service";
import type { Group } from "@/types/api.types";

// Schema for weekly schedule generation
const generateWeeklyScheduleSchema = z.object({
  group_id: z.number().min(1, "Vui lòng chọn nhóm học"),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
}).refine((data) => data.end_date >= data.start_date, {
  message: "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu",
  path: ["end_date"],
});

type GenerateWeeklyScheduleData = z.infer<typeof generateWeeklyScheduleSchema>;

interface GenerateWeeklyScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (data: GenerateWeeklyScheduleData) => Promise<void>;
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
      start_date: new Date(),
      end_date: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 6); // Default to one week
        return date;
      })(),
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
      await onGenerate(data);
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

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo lịch học tuần</DialogTitle>
          <DialogDescription>
            Tạo lịch học tuần dựa trên lịch trình template của nhóm trong khoảng thời gian đã chọn.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Group Selection */}
            <FormField
              control={form.control}
              name="group_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhóm học</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                    disabled={loadingGroups}
                  >
                    <FormControl>
                      <SelectTrigger>
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày bắt đầu</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={formatDateForInput(field.value)}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày kết thúc</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={formatDateForInput(field.value)}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Lưu ý:</strong> Tính năng này sẽ tự động tạo lịch học cho nhóm được chọn
                dựa trên lịch trình template của nhóm trong khoảng thời gian đã chọn.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={loading || loadingGroups}
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