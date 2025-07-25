import TeacherSelect from "@/components/features/teacher-select";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [date, setDate] = useState<string>();
  const [value, setValue] = useState<string>();
  useEffect(() => {
    console.log(date);
  }, [date]);
  useEffect(() => {
    console.log(value);
  }, [value]);

  return (
    <div>
      <h1>Dashboard</h1>
      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <TeacherSelect value={value} handleSelect={(value) => setValue(value)} />
    </div>
  );
};

export default Dashboard;