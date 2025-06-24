import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { groupService, gradeService } from "@/service";
import { Group, Grade } from "@/types/api.types";
import { useToast } from "@/components/ui/use-toast";

const groupFormSchema = z.object({
  name: z.string().min(1, "Tên nhóm không được để trống"),
  grade_id: z.number().min(1, "Vui lòng chọn khối học"),
  max_students: z.number().min(1, "Số lượng học sinh tối thiểu là 1"),
});

type GroupFormData = z.infer<typeof groupFormSchema>;

interface GroupFormProps {
  initialData?: Group | null;
  onSubmit: (data: GroupFormData) => Promise<void>;
}

export const GroupForm = ({ initialData, onSubmit }: GroupFormProps) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      grade_id: initialData?.grade_id || 0,
      max_students: initialData?.max_students || 20,
    },
  });

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await gradeService.getAllGrades();
        setGrades(data);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch grades",
          variant: "destructive",
        });
      }
    };

    fetchGrades();
  }, []);

  const handleSubmit = async (data: GroupFormData) => {
    try {
      setLoading(true);
      await onSubmit(data);
      toast({
        title: "Success",
        description: initialData ? "Group updated successfully" : "Group created successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save group",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên Nhóm</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nhập tên nhóm" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="grade_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Khối Học</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khối học" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id.toString()}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="max_students"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số Học Sinh Tối Đa</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  min={1}
                  placeholder="Nhập số lượng tối đa"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
