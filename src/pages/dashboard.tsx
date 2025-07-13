import UploadAndViewFile from '@/components/file-view-and-picker/upload-and-view-file';
import { usePageTitle } from '@/hooks/usePageTitle';

const Dashboard = () => {
  usePageTitle('Dashboard');

  return (
    <div className="space-y-4">
      <UploadAndViewFile />
    </div>
  );
};

export default Dashboard;
