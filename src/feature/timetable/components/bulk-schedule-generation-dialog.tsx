import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGroup } from '@/hooks/useGroup';
import { Group, Schedule } from '@/types/api.types';
import {
  AlertCircle,
  CheckCircle,
  Download,
  Loader2,
  Users,
  Calendar as CalendarIcon,
  Clock,
  Building,
  GraduationCap
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  generateBulkSchedulesForGroups,
  generateBulkSchedulesForAllGroups,
  generateNextWeekSchedules,
  triggerAutoGeneration
} from '@/service/time-table.service';

interface BulkScheduleGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (generatedCount: number) => void;
}

interface GenerationProgress {
  total: number;
  completed: number;
  errors: number;
  currentStep: string;
  generatedSchedules: Schedule[];
  errorDetails: string[];
}

type GenerationMode = 'selected-groups' | 'all-groups' | 'next-week' | 'auto-trigger';

export const BulkScheduleGenerationDialog = ({
  open,
  onOpenChange,
  onSuccess
}: BulkScheduleGenerationDialogProps) => {
  const { groups, handleFetchGroupsWithDetail } = useGroup();

  const [generationMode, setGenerationMode] = useState<GenerationMode>('selected-groups');
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress>({
    total: 0,
    completed: 0,
    errors: 0,
    currentStep: '',
    generatedSchedules: [],
    errorDetails: []
  });

  useEffect(() => {
    if (open) {
      handleFetchGroupsWithDetail();
      // Reset state when dialog opens
      setGenerationMode('selected-groups');
      setSelectedGroupIds([]);
      setStartDate(undefined);
      setEndDate(undefined);
      setIsGenerating(false);
      setGenerationComplete(false);
      setProgress({
        total: 0,
        completed: 0,
        errors: 0,
        currentStep: '',
        generatedSchedules: [],
        errorDetails: []
      });
    }
  }, [open, handleFetchGroupsWithDetail]);

  const selectedGroups = groups.filter(g => selectedGroupIds.includes(g.id!));
  const totalStudents = selectedGroups.reduce((sum, group) => sum + (group.student_details?.length || 0), 0);

  const handleGroupToggle = (groupId: number, checked: boolean) => {
    if (checked) {
      setSelectedGroupIds(prev => [...prev, groupId]);
    } else {
      setSelectedGroupIds(prev => prev.filter(id => id !== groupId));
    }
  };

  const handleSelectAllGroups = (checked: boolean) => {
    if (checked) {
      setSelectedGroupIds(groups.map(g => g.id!));
    } else {
      setSelectedGroupIds([]);
    }
  };

  const isFormValid = () => {
    switch (generationMode) {
      case 'selected-groups':
        return selectedGroupIds.length > 0 && startDate && endDate;
      case 'all-groups':
        return startDate && endDate;
      case 'next-week':
      case 'auto-trigger':
        return true;
      default:
        return false;
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!isFormValid()) return;

    setIsGenerating(true);
    setProgress(prev => ({
      ...prev,
      total: generationMode === 'selected-groups' ? selectedGroupIds.length : groups.length,
      currentStep: 'Khởi tạo quá trình tạo lịch học...'
    }));

    try {
      const progressSteps = [
        'Kiểm tra thông tin nhóm...',
        'Tạo lịch học theo mẫu...',
        'Kiểm tra xung đột lịch học...',
        'Hoàn tất quá trình...'
      ];

      // Simulate progress updates
      for (let i = 0; i < progressSteps.length - 1; i++) {
        setProgress(prev => ({
          ...prev,
          currentStep: progressSteps[i],
          completed: Math.floor((i / progressSteps.length) * prev.total)
        }));
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      let generatedCount = 0;

      switch (generationMode) {
        case 'selected-groups': {
          const result = await generateBulkSchedulesForGroups({
            group_ids: selectedGroupIds,
            start_date: format(startDate!, 'yyyy-MM-dd'),
            end_date: format(endDate!, 'yyyy-MM-dd')
          });
          generatedCount = result.length;
          setProgress(prev => ({
            ...prev,
            completed: result.flat().length,
            errors: 0,
            generatedSchedules: result.flat(),
            errorDetails: [],
            currentStep: 'Hoàn thành!'
          }));
          break;
        }

        case 'all-groups': {
          const result = await generateBulkSchedulesForAllGroups(
            format(startDate!, 'yyyy-MM-dd'),
            format(endDate!, 'yyyy-MM-dd')
          );
          generatedCount = result.length;
          setProgress(prev => ({
            ...prev,
            completed: result.flat().length,
            errors: 0,
            generatedSchedules: result.flat(),
            errorDetails: [],
            currentStep: 'Hoàn thành!'
          }));
          break;
        }

        case 'next-week':
          await generateNextWeekSchedules();
          generatedCount = 1; // Placeholder
          setProgress(prev => ({
            ...prev,
            completed: 1,
            currentStep: 'Hoàn thành tạo lịch tuần tới!'
          }));
          break;

        case 'auto-trigger':
          await triggerAutoGeneration();
          generatedCount = 1; // Placeholder
          setProgress(prev => ({
            ...prev,
            completed: 1,
            currentStep: 'Hoàn thành kích hoạt tự động!'
          }));
          break;
      }

      setGenerationComplete(true);
      onSuccess?.(generatedCount);

    } catch (error) {
      console.error('Error generating schedules:', error);
      setProgress(prev => ({
        ...prev,
        errors: prev.errors + 1,
        currentStep: 'Có lỗi xảy ra khi tạo lịch học',
        errorDetails: [
          ...prev.errorDetails,
          error instanceof Error ? error.message : 'Lỗi không xác định'
        ]
      }));
    } finally {
      setIsGenerating(false);
    }
  }, [generationMode, selectedGroupIds, startDate, endDate, groups.length, onSuccess]);

  const handleClose = () => {
    if (!isGenerating) {
      onOpenChange(false);
    }
  };

  const exportResults = () => {
    const csvContent = progress.generatedSchedules.flat().map(schedule =>
      `${schedule.group_id},${schedule.start_time},${schedule.end_time},${schedule.delivery_mode}`
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-schedule-generation-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTotalSchedulesGenerated = () => {
    return progress.generatedSchedules.length;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Tạo lịch học hàng loạt</span>
          </DialogTitle>
          <DialogDescription>
            Tạo lịch học tự động cho nhiều nhóm trong một lần thao tác
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!isGenerating && !generationComplete && (
            <>
              {/* Generation Mode Selection */}
              <div className="space-y-2">
                <Label htmlFor="mode-select">Chế độ tạo lịch</Label>
                <Select
                  value={generationMode}
                  onValueChange={(value: GenerationMode) => setGenerationMode(value)}
                >
                  <SelectTrigger id="mode-select">
                    <SelectValue placeholder="Chọn chế độ tạo lịch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="selected-groups">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Nhóm được chọn</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="all-groups">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Tất cả nhóm hoạt động</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="next-week">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Tuần tới (tự động)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="auto-trigger">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span>Kích hoạt tự động</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Selection for selected-groups and all-groups */}
              {(generationMode === 'selected-groups' || generationMode === 'all-groups') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ngày bắt đầu</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Ngày kết thúc</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {/* Group Selection for selected-groups mode */}
              {generationMode === 'selected-groups' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Chọn nhóm học</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all"
                        checked={selectedGroupIds.length === groups.length}
                        onCheckedChange={handleSelectAllGroups}
                      />
                      <Label htmlFor="select-all" className="text-sm">Chọn tất cả</Label>
                    </div>
                  </div>

                  <ScrollArea className="h-48 border rounded-md p-4">
                    <div className="grid grid-cols-1 gap-2">
                      {groups.map((group: Group) => {
                        return (
                          <div key={group.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded">
                            <Checkbox
                              id={`group-${group.id}`}
                              checked={selectedGroupIds.includes(group.id!)}
                              onCheckedChange={(checked) => handleGroupToggle(group.id!, checked as boolean)}
                            />
                            <div className="flex-1">
                              <Label htmlFor={`group-${group.id}`} className="font-medium">
                                {group.name}
                              </Label>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{group.level}</span>
                                <Badge variant="outline">
                                  {group.student_details?.length || 0} học sinh
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>

                  {selectedGroups.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Tóm tắt lựa chọn</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="space-y-1">
                            <p className="text-2xl font-bold text-blue-600">
                              {selectedGroups.length}
                            </p>
                            <p className="text-xs text-muted-foreground">Nhóm học</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-2xl font-bold text-green-600">
                              {totalStudents}
                            </p>
                            <p className="text-xs text-muted-foreground">Học sinh</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-2xl font-bold text-purple-600">
                              ~{selectedGroups.reduce((sum, group) => sum + (group.group_schedules?.length || 0), 0)}
                            </p>
                            <p className="text-xs text-muted-foreground">Lịch học/tuần</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Mode Descriptions */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Thông tin chế độ</AlertTitle>
                <AlertDescription>
                  {generationMode === 'selected-groups' &&
                    'Tạo lịch học cho các nhóm được chọn trong khoảng thời gian chỉ định.'
                  }
                  {generationMode === 'all-groups' &&
                    'Tạo lịch học cho tất cả các nhóm đang hoạt động trong khoảng thời gian chỉ định.'
                  }
                  {generationMode === 'next-week' &&
                    'Tự động tạo lịch học cho tuần tới (Thứ 2 - Chủ nhật) cho tất cả các nhóm.'
                  }
                  {generationMode === 'auto-trigger' &&
                    'Kích hoạt thủ công quá trình tự động tạo lịch (thường chạy vào thứ 2 hàng tuần).'
                  }
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* Generation Progress */}
          {isGenerating && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang tạo lịch học...</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{progress.currentStep}</span>
                    <span>{progress.completed} / {progress.total}</span>
                  </div>
                  <Progress
                    value={progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}
                    className="h-2"
                  />
                </div>

                {progress.errors > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Có lỗi xảy ra</AlertTitle>
                    <AlertDescription>
                      {progress.errors} lỗi trong quá trình tạo lịch học
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Generation Results */}
          {generationComplete && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Hoàn thành tạo lịch học</span>
                </CardTitle>
                <CardDescription>
                  Đã tạo thành công {getTotalSchedulesGenerated()} lịch học
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600">
                      {progress.completed}
                    </p>
                    <p className="text-xs text-muted-foreground">Thành công</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-red-600">
                      {progress.errors}
                    </p>
                    <p className="text-xs text-muted-foreground">Lỗi</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-blue-600">
                      {getTotalSchedulesGenerated()}
                    </p>
                    <p className="text-xs text-muted-foreground">Lịch học</p>
                  </div>
                </div>

                {/* Generated Schedules Summary */}
                {progress.generatedSchedules.length > 0 && (
                  <div className="space-y-2">
                    <Label>Tóm tắt lịch học được tạo</Label>
                    <ScrollArea className="h-32 border rounded-md p-3">
                      {progress.generatedSchedules.map((schedule, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">Nhóm {schedule.group_name}: </span>
                          <span className="text-muted-foreground">
                            {schedule.start_time} - {schedule.end_time}
                          </span>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}

                {/* Error Details */}
                {progress.errorDetails.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Chi tiết lỗi</AlertTitle>
                    <AlertDescription>
                      <ScrollArea className="h-20 mt-2">
                        {progress.errorDetails.map((error, index) => (
                          <div key={index} className="text-xs">
                            <strong>Lỗi {index + 1}:</strong> {error}
                          </div>
                        ))}
                      </ScrollArea>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          {generationComplete && (
            <Button variant="outline" onClick={exportResults} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Xuất kết quả</span>
            </Button>
          )}

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isGenerating}
            >
              {generationComplete ? 'Đóng' : 'Hủy'}
            </Button>

            {!isGenerating && !generationComplete && (
              <Button
                onClick={handleGenerate}
                disabled={!isFormValid()}
                className="flex items-center space-x-2"
              >
                <CalendarIcon className="h-4 w-4" />
                <span>Tạo lịch học</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent >
    </Dialog >
  );
};