import TeacherSelect from "@/components/features/teacher-select";
import { IReferenceData } from "@/components/file-view-and-picker/media";
import { Calendar } from "@/components/ui/calendar";
import axios from "axios";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

// Loading animation component với dấu 3 chấm nhảy nhảy
const LoadingDots = () => {
  return (
    <div className="flex space-x-1">
      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
};

export const getReferenceData = async (): Promise<IReferenceData> => {
  const response = await axios.get('https://vsdp-api.development.thanhlp18.info/api/v1/public/applicant/reference-data');
  return response.data;
};

const Dashboard = () => {

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Loading animation */}
      {true && (
        <div className="flex justify-center items-center p-8">
          <LoadingDots />
        </div>
      )}


    </div>
  );
};

export default Dashboard;