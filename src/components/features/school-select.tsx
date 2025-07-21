import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useSchool } from '@/hooks/useSchool';

interface SchoolSelectProps {
  handleSelect: (value: string) => void;
  value?: string;
}

const SchoolSchema = z.object({
  name: z.string().min(1, { message: 'Hãy nhập tên trường' }),
});

const SchoolSelect: FC<SchoolSelectProps> = ({ handleSelect, value }) => {
  const { schools, handleFetchSchools, handleCreateSchool } = useSchool();
  const [selectedValue, setSelectedValue] = useState<string>(value || '');
  const [isNewSchoolDialogOpen, setIsNewSchoolDialogOpen] = useState(false);
  const [creatingSchool, setCreatingSchool] = useState(false);

  const schoolForm = useForm<z.infer<typeof SchoolSchema>>({
    resolver: zodResolver(SchoolSchema),
    defaultValues: {
      name: ''
    },
  });

  useEffect(() => {
    if (schools.length === 0) {
      handleFetchSchools();
    }
  }, [schools, handleFetchSchools]);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const options = [
    { value: '-1', label: 'Không chọn' },
    ...schools.map((school) => ({
      value: school.id?.toString() ?? '',
      label: school.name,
    })),
    { value: 'new', label: '+ Tạo trường mới...' },
  ];

  const handleChange = (val: string) => {
    if (val === 'new') {
      setIsNewSchoolDialogOpen(true);
      return;
    }
    setSelectedValue(val);
    handleSelect(val);
  };

  const handleCreateNewSchool = async (data: z.infer<typeof SchoolSchema>) => {
    try {
      setCreatingSchool(true);
      const newSchool = {
        name: data.name,
      };

      await handleCreateSchool(newSchool);
      toast.success('Tạo trường mới thành công');
      setIsNewSchoolDialogOpen(false);
      schoolForm.reset();
      await handleFetchSchools();
    } catch (error) {
      toast.error('Không thể tạo trường mới');
    } finally {
      setCreatingSchool(false);
    }
  };

  return (
    <div>
      <SearchableSelect
        options={options}
        value={selectedValue}
        onValueChange={handleChange}
        placeholder="Chọn trường"
        searchPlaceholder="Tìm kiếm trường..."
        className="w-full"
      />

      <Dialog open={isNewSchoolDialogOpen} onOpenChange={setIsNewSchoolDialogOpen}>
        <DialogContent aria-describedby="dialog-description">
          <DialogHeader>
            <DialogTitle>Tạo trường mới</DialogTitle>
            <DialogDescription id="dialog-description" className="text-sm text-muted-foreground">
              Điền thông tin để tạo trường học mới
            </DialogDescription>
          </DialogHeader>
          <Form {...schoolForm}>
            <form onSubmit={schoolForm.handleSubmit(handleCreateNewSchool)} className="space-y-4">
              <FormField
                control={schoolForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên trường</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập tên trường" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewSchoolDialogOpen(false)}
                  disabled={creatingSchool}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={creatingSchool}>
                  {creatingSchool ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo trường'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolSelect;
