import { formatUtcToVietnamDateTime } from "@/utils/timezone-utils";

const Dashboard = () => {

  console.log(formatUtcToVietnamDateTime('2025-07-12'));

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
};

export default Dashboard;