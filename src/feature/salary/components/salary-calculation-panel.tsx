import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSalary } from '@/hooks';
import type { Teacher, TeacherMonthlySummary } from '@/types/api.types';
import { Calculator, Users, RefreshCw, TrendingUp } from 'lucide-react';

const calculationSchema = z.object({
  month: z.string().min(1, 'Vui lòng chọn tháng'),
  year: z.string().min(1, 'Vui lòng chọn năm'),
});

interface SalaryCalculationPanelProps {
  teacher: Teacher | null;
  onCalculationComplete?: (summary: TeacherMonthlySummary) => void;
}

export const SalaryCalculationPanel = ({ teacher, onCalculationComplete }: SalaryCalculationPanelProps) => {
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const {
    handleCalculateMonthlySalary,
    handleCalculateAllMonthlySalaries,
    handleRecalculateMonthlySalary,
    currentSummary,
    calculationLoading,
    calculationError
  } = useSalary();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const form = useForm<z.infer<typeof calculationSchema>>({
    resolver: zodResolver(calculationSchema),
    defaultValues: {
      month: currentMonth.toString(),
      year: currentYear.toString(),
    },
  });

  const bulkForm = useForm<z.infer<typeof calculationSchema>>({
    resolver: zodResolver(calculationSchema),
    defaultValues: {
      month: currentMonth.toString(),
      year: currentYear.toString(),
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  const getMonthName = (month: number) => {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return months[month - 1];
  };

  const onCalculate = async (values: z.infer<typeof calculationSchema>) => {
    if (!teacher?.id) return;

    try {
      const resultAction = await handleCalculateMonthlySalary(teacher.id, {
        month: parseInt(values.month),
        year: parseInt(values.year),
      });

      if (resultAction.payload) {
        toast.success(`Tính lương ${getMonthName(parseInt(values.month))}/${values.year} thành công`);
        onCalculationComplete?.(resultAction.payload as TeacherMonthlySummary);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tính lương');
    }
  };

  const onRecalculate = async (values: z.infer<typeof calculationSchema>) => {
    if (!teacher?.id) return;

    try {
      const resultAction = await handleRecalculateMonthlySalary(teacher.id, {
        month: parseInt(values.month),
        year: parseInt(values.year),
      });

      if (resultAction.payload) {
        toast.success(`Tính lại lương ${getMonthName(parseInt(values.month))}/${values.year} thành công`);
        onCalculationComplete?.(resultAction.payload as TeacherMonthlySummary);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tính lại lương');
    }
  };

  const onBulkCalculate = async (values: z.infer<typeof calculationSchema>) => {
    try {
      const resultAction = await handleCalculateAllMonthlySalaries({
        month: parseInt(values.month),
        year: parseInt(values.year),
      });

      if (resultAction.payload) {
        toast.success(`Tính lương cho tất cả giáo viên ${getMonthName(parseInt(values.month))}/${values.year} thành công`);
        setShowBulkDialog(false);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tính lương hàng loạt');
    }
  };

  const generateYearOptions = () => {
    const years = [];
    for (let year = currentYear - 2; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  };

  const generateMonthOptions = (selectedYear: string) => {
    const months = [];
    const year = parseInt(selectedYear);
    const maxMonth = year === currentYear ? currentMonth : 12;

    for (let month = 1; month <= maxMonth; month++) {
      months.push(month);
    }
    return months;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Tính lương
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Individual Calculation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Tính lương cá nhân</h3>
            {!teacher && (
              <Badge variant="outline" className="text-muted-foreground">
                Chọn giáo viên
              </Badge>
            )}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCalculate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Năm</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn năm" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {generateYearOptions().map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
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
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tháng</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn tháng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {generateMonthOptions(form.watch('year')).map((month) => (
                            <SelectItem key={month} value={month.toString()}>
                              {getMonthName(month)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {calculationError && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {calculationError}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={!teacher || calculationLoading}
                  className="flex-1"
                >
                  {calculationLoading ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Tính lương
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={!teacher || calculationLoading}
                  onClick={() => form.handleSubmit(onRecalculate)()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Calculation Result */}
        {currentSummary && (
          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-green-800 dark:text-green-200">
                Kết quả tính lương {getMonthName(currentSummary.month)}/{currentSummary.year}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Buổi dạy:</span>
                <p className="font-medium">
                  {currentSummary.completed_lessons}/{currentSummary.scheduled_lessons}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Tỷ lệ hoàn thành:</span>
                <p className="font-medium">
                  {formatPercentage(currentSummary.completion_rate)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Lương cơ bản:</span>
                <p className="font-medium">
                  {formatCurrency(currentSummary.base_salary)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Thưởng hiệu suất:</span>
                <p className="font-medium">
                  {formatCurrency(currentSummary.performance_bonus)}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Tổng lương:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(currentSummary.total_salary)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Calculation Button */}
        <div className="pt-4 border-t">
          <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Tính lương hàng loạt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tính lương cho tất cả giáo viên</DialogTitle>
              </DialogHeader>

              <Form {...bulkForm}>
                <form onSubmit={bulkForm.handleSubmit(onBulkCalculate)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={bulkForm.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Năm</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn năm" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {generateYearOptions().map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bulkForm.control}
                      name="month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tháng</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn tháng" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {generateMonthOptions(bulkForm.watch('year')).map((month) => (
                                <SelectItem key={month} value={month.toString()}>
                                  {getMonthName(month)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
                    ⚠️ Thao tác này sẽ tính lương cho tất cả giáo viên có cấu hình lương.
                    Vui lòng kiểm tra kỹ trước khi thực hiện.
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      disabled={calculationLoading}
                      className="flex-1"
                    >
                      {calculationLoading ? (
                        <>Loading...</>
                      ) : (
                        <>
                          <Calculator className="h-4 w-4 mr-2" />
                          Xác nhận tính lương
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowBulkDialog(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};