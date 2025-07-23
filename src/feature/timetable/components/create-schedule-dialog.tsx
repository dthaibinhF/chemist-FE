import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useTimetable } from "../hooks/useTimetable";
import { usePermissions } from "../hooks/usePermissions";
import { ScheduleForm } from "./schedule-form";
import type { ScheduleFormData } from "../schemas/timetable.schema";

interface CreateScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateScheduleDialog: React.FC<CreateScheduleDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { handleCreateSchedule, loading } = useTimetable();
  const { hasPermission } = usePermissions();

  const handleSubmit = async (data: ScheduleFormData) => {
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
        attendances: [],
      };

      await handleCreateSchedule(scheduleData as any);
      onOpenChange(false);
    } catch (error) {
      console.error("Lỗi khi tạo lịch học:", error);
    }
  };

  // Check if user has permission to create schedules
  if (!hasPermission('canCreate')) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo lịch học mới</DialogTitle>
        </DialogHeader>
        <ScheduleForm
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};