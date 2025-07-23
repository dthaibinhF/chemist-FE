import React, { useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useTimetable } from "../hooks/useTimetable";
import { ScheduleForm } from "./schedule-form";
import type { ScheduleFormData } from "../schemas/timetable.schema";

interface EditScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleId: number | null;
}

export const EditScheduleDialog: React.FC<EditScheduleDialogProps> = ({
  open,
  onOpenChange,
  scheduleId,
}) => {
  const { 
    handleUpdateSchedule, 
    handleFetchSchedule, 
    schedule, 
    loading 
  } = useTimetable();

  // Load schedule data when dialog opens
  useEffect(() => {
    if (open && scheduleId) {
      handleFetchSchedule(scheduleId);
    }
  }, [open, scheduleId, handleFetchSchedule]);

  const handleSubmit = async (data: ScheduleFormData) => {
    if (!scheduleId) return;

    try {
      // Transform form data to match API expectations
      const scheduleData = {
        group_id: data.group_id,
        start_time: data.start_time,
        end_time: data.end_time,
        delivery_mode: data.delivery_mode,
        meeting_link: data.meeting_link || "",
        // Note: teacher_id and room_id will need to be handled based on API structure
        teacher: { account: { id: data.teacher_id } },
        room: { id: data.room_id },
      };

      await handleUpdateSchedule(scheduleId, scheduleData as any);
      onOpenChange(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật lịch học:", error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa lịch học</DialogTitle>
        </DialogHeader>
        {schedule || loading ? (
          <ScheduleForm
            onSubmit={handleSubmit}
            initialData={schedule}
            loading={loading}
            onCancel={handleClose}
          />
        ) : (
          <div className="flex justify-center items-center py-8">
            <div className="text-sm text-muted-foreground">Không tìm thấy dữ liệu lịch học</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};