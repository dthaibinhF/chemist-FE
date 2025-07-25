import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [date, setDate] = useState<string>();

  useEffect(() => {
    console.log(date);
  }, [date]);

  return (
    <div>
      <h1>Dashboard</h1>
      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
    </div>
  );
};

export default Dashboard;