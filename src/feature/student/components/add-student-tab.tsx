import { PlusIcon, FileSpreadsheetIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useRolePermissions } from '@/hooks/useRolePermissions';

import { AddStudentCsvFile } from './add-student-cvs-file';
import { FormAddStudent } from './form-add-student';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddStudentTabProps {
  groupId?: number;
  gradeId?: number;
  onStudentAdded?: () => void;
}

export const AddStudentTab = ({ groupId, gradeId, onStudentAdded }: AddStudentTabProps) => {
  const { student } = useRolePermissions();

  return (
    <div className="flex gap-2">
      {/* Dialog for Manual Student Entry */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 px-4 py-2">
            <PlusIcon className="w-4 h-4" />
            Thêm thủ công
          </Button>
        </DialogTrigger>
        <DialogContent className="min-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm học sinh thủ công</DialogTitle>
            <DialogDescription>Điền thông tin học sinh vào form dưới đây</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <FormAddStudent
              groupId={groupId}
              gradeId={gradeId}
              onStudentAdded={onStudentAdded}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Drawer for CSV Import - Only show for users who can create students */}
      {student.canCreateStudent && (
        <Drawer direction="bottom">
          <DrawerTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 px-4 py-2">
              <FileSpreadsheetIcon className="w-4 h-4" />
              Import CSV
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[90vh] max-h-[800px]">
            <ScrollArea className="h-[90vh] max-h-[700px]">
              <div className="mx-auto w-full max-w-full">
                <DrawerHeader>
                  <DrawerTitle>Import học sinh từ file CSV</DrawerTitle>
                  <DrawerDescription>
                    Tải lên file CSV để import nhiều học sinh cùng lúc. Hỗ trợ preview và chỉnh sửa trước khi lưu.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-4 h-full overflow-hidden">
                  <AddStudentCsvFile
                    groupId={groupId}
                    gradeId={gradeId}
                    onStudentAdded={onStudentAdded}
                  />
                </div>
              </div>
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

