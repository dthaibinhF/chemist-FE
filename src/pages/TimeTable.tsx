import React from "react";
import { TimetableView } from "@/feature/timetable/components";

const TimeTable: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <TimetableView />
    </div>
  );
};

export default TimeTable;
