import TeacherSelect from "@/components/features/teacher-select";
import { IReferenceData } from "@/components/file-view-and-picker/media";
import { Calendar } from "@/components/ui/calendar";
import axios from "axios";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

export const getReferenceData = async (): Promise<IReferenceData> => {
  const response = await axios.get('https://vsdp-api.development.thanhlp18.info/api/v1/public/applicant/reference-data');
  return response.data;
};

const Dashboard = () => {
  const [date, setDate] = useState<Date>(new Date('2003-11-18'));
  const [value, setValue] = useState<string>();
  useEffect(() => {
    // Date changed
  }, [date]);
  useEffect(() => {
    // Value changed
  }, [value]);
  useEffect(() => {
    getReferenceData().then(() => {
      // Data loaded
    });
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <Calendar mode="single"  selected={date} onSelect={setDate}
        required
        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
      />
      <TeacherSelect value={value} handleSelect={(value) => setValue(value)} />
      <Input type="text" value={value} onChange={(e) => setValue(e.target.value)} />
    </div>
  );
};

export default Dashboard;