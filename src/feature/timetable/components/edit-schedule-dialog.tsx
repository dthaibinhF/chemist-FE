import React, { useEffect, useRef } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useTimetable } from "../hooks/useTimetable";
import { ScheduleForm } from "./schedule-form";
import type { ScheduleFormData } from "../schemas/timetable.schema";
import { parseDateTimeLocalToUtc, formatDateTimeForApi } from "@/utils/timezone-utils";
import { toast } from "sonner";
import type { Schedule } from "@/types/api.types";
import { roomService } from "@/service/room.service";

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
    handleClearSchedule,
    schedule,
    loading
  } = useTimetable();

  const currentScheduleIdRef = useRef<number | null>(null);

  // Load schedule data when dialog opens
  useEffect(() => {
    if (open && scheduleId && scheduleId !== currentScheduleIdRef.current) {
      currentScheduleIdRef.current = scheduleId;
      handleFetchSchedule(scheduleId);
    }
  }, [open, scheduleId, handleFetchSchedule]);

  // Clear schedule data when dialog closes
  useEffect(() => {
    if (!open) {
      // Clear the schedule state when dialog closes to prevent stale data
      handleClearSchedule();
      currentScheduleIdRef.current = null;
    }
  }, [open, handleClearSchedule]);


  const handleSubmit = async (data: ScheduleFormData) => {
    if (!scheduleId) return;

    try {
      // Convert datetime-local strings to proper API format
      const startTimeUtc = parseDateTimeLocalToUtc(data.start_time);
      const endTimeUtc = parseDateTimeLocalToUtc(data.end_time);

      // Fetch room data and wait for it
      const roomResult = await roomService.getRoomById(data.room_id);
      const roomData = roomResult;
      // Transform form data to match API expectations
      const scheduleData = {
        group_id: data.group_id,
        start_time: formatDateTimeForApi(startTimeUtc),
        end_time: formatDateTimeForApi(endTimeUtc),
        delivery_mode: data.delivery_mode,
        meeting_link: data.meeting_link || "",
        teacher_id: data.teacher_id,
        room: roomData,
      } as Schedule;

      await handleUpdateSchedule(scheduleId, scheduleData);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi cập nhật lịch học");
    }
  };

  const handleClose = () => {
    // Clear schedule data before closing to prevent stale state
    handleClearSchedule();
    onOpenChange(false);
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (currentScheduleIdRef.current) {
        handleClearSchedule();
        currentScheduleIdRef.current = null;
      }
    };
  }, [handleClearSchedule]);

  return (
    <Dialog key={`edit-dialog-${scheduleId}`} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa lịch học</DialogTitle>
        </DialogHeader>
        {schedule || loading ? (
          <ScheduleForm
            key={`schedule-form-${scheduleId}`}
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