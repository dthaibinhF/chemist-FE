import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { AddStudentCsvFile } from './add-student-cvs-file';
import { FormAddStudent } from './form-add-student';

interface AddStudentTabProps {
  groupId?: number;
  gradeId?: number;
}

export const AddStudentTab = ({ groupId, gradeId }: AddStudentTabProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // // Reset tab to manual when dialog closes
    // if (!open) {
    //   // Reset tab to manual when dialog closes
    //   setActiveTab('manual');
    // }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 px-4 py-2">
            <PlusIcon className="w-4 h-4" />
            Thêm học sinh
          </Button>
        </DialogTrigger>
        <DialogContent className="min-w-[1200px] w-full">
          <DialogHeader className="mb-4">
            <DialogTitle>Thêm học sinh</DialogTitle>
            <DialogDescription>Chọn thêm thủ công hoặc thêm bằng file CSV</DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="">
              <TabsTrigger value="manual" className="py-2">
                Thêm thủ công
              </TabsTrigger>
              <TabsTrigger value="csv" className="py-2">
                Thêm bằng CSV
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <div className="p-5 border rounded-lg shadow-sm w-full">
                <FormAddStudent
                  groupId={groupId}
                  gradeId={gradeId}
                />
              </div>
            </TabsContent>

            <TabsContent value="csv" className="mt-1 w-full overflow-hidden">
              <AddStudentCsvFile
                groupId={groupId}
                gradeId={gradeId}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};
