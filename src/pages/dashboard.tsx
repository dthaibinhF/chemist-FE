import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  useEffect(() => {
    console.log(date);
  }, [date]);
  return (
    <div className="p-6 space-y-6">
      <Calendar
        mode="range"
        month={date?.from ?? new Date()}
        numberOfMonths={2}
        selected={date}
        onSelect={setDate}
        className="rounded-lg border shadow-sm"
      />
    </div>
  );
};

export default Dashboard;