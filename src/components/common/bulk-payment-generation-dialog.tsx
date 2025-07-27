import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useGroup } from '@/hooks/useGroup';
import { useStudentPaymentSummary } from '@/hooks/useStudentPaymentSummary';
import { Group, StudentPaymentSummary } from '@/types/api.types';
import { AlertCircle, CheckCircle, Download, Loader2, Users, DollarSign } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface BulkPaymentGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (generatedCount: number) => void;
}

interface GenerationProgress {
  total: number;
  completed: number;
  errors: number;
  currentStep: string;
  generatedSummaries: StudentPaymentSummary[];
  errorDetails: Array<{ studentName: string; error: string }>;
}

export const BulkPaymentGenerationDialog = ({
  open,
  onOpenChange,
  onSuccess
}: BulkPaymentGenerationDialogProps) => {
  const { groups, loading: groupsLoading, handleFetchGroups } = useGroup();
  const {
    handleGenerateAllPaymentsForGroup,
    formatCurrency,
    loading: generationLoading
  } = useStudentPaymentSummary();

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress>({
    total: 0,
    completed: 0,
    errors: 0,
    currentStep: '',
    generatedSummaries: [],
    errorDetails: []
  });

  useEffect(() => {
    if (open) {
      handleFetchGroups();
      // Reset state when dialog opens
      setSelectedGroupId(null);
      setIsGenerating(false);
      setGenerationComplete(false);
      setProgress({
        total: 0,
        completed: 0,
        errors: 0,
        currentStep: '',
        generatedSummaries: [],
        errorDetails: []
      });
    }
  }, [open, handleFetchGroups]);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const studentCount = selectedGroup?.student_details?.length || 0;

  const handleGenerate = useCallback(async () => {
    if (!selectedGroupId) return;

    setIsGenerating(true);
    setProgress(prev => ({
      ...prev,
      total: studentCount,
      currentStep: 'Khởi tạo quá trình tạo thanh toán...'
    }));

    try {
      // Simulate progress updates
      const progressSteps = [
        'Kiểm tra thông tin nhóm...',
        'Tạo nghĩa vụ thanh toán cho học sinh...',
        'Cập nhật trạng thái thanh toán...',
        'Hoàn tất quá trình...'
      ];

      for (let i = 0; i < progressSteps.length; i++) {
        setProgress(prev => ({
          ...prev,
          currentStep: progressSteps[i],
          completed: Math.floor((i / progressSteps.length) * studentCount)
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      await handleGenerateAllPaymentsForGroup(selectedGroupId);

      setProgress(prev => ({
        ...prev,
        completed: studentCount,
        generatedSummaries: [], // Will be populated from Redux state if needed
        currentStep: 'Hoàn thành!'
      }));

      setGenerationComplete(true);
      onSuccess?.(studentCount);

    } catch (error) {
      console.error('Error generating payments:', error);
      setProgress(prev => ({
        ...prev,
        errors: prev.errors + 1,
        currentStep: 'Có lỗi xảy ra khi tạo thanh toán',
        errorDetails: [
          ...prev.errorDetails,
          { studentName: 'Chung', error: error instanceof Error ? error.message : 'Lỗi không xác định' }
        ]
      }));
    } finally {
      setIsGenerating(false);
    }
  }, [selectedGroupId, studentCount, handleGenerateAllPaymentsForGroup, onSuccess]);

  const handleClose = () => {
    if (!isGenerating) {
      onOpenChange(false);
    }
  };

  const exportResults = () => {
    // Mock export functionality
    const csvContent = progress.generatedSummaries.map(summary =>
      `${summary.student_name},${summary.fee_name},${summary.total_amount_due},${summary.payment_status}`
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-payment-generation-${selectedGroup?.name || 'results'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Tạo nghĩa vụ thanh toán hàng loạt</span>
          </DialogTitle>
          <DialogDescription>
            Tạo nghĩa vụ thanh toán cho tất cả học sinh trong nhóm được chọn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!isGenerating && !generationComplete && (
            <>
              {/* Group Selection */}
              <div className="space-y-2">
                <Label htmlFor="group-select">Chọn nhóm học</Label>
                <Select
                  value={selectedGroupId?.toString() || ''}
                  onValueChange={(value) => setSelectedGroupId(parseInt(value))}
                  disabled={groupsLoading}
                >
                  <SelectTrigger id="group-select">
                    <SelectValue placeholder="Chọn nhóm để tạo thanh toán" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group: Group) => (
                      <SelectItem key={group.id} value={group.id!.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{group.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {group.student_details?.length || 0} học sinh
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Group Details */}
              {selectedGroup && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Thông tin nhóm</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tên nhóm:</span>
                        <p className="font-medium">{selectedGroup.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cấp độ:</span>
                        <p className="font-medium">{selectedGroup.level}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phí học:</span>
                        <p className="font-medium">{selectedGroup.fee_name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Năm học:</span>
                        <p className="font-medium">{selectedGroup.academic_year}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Sẽ tạo nghĩa vụ thanh toán cho <strong>{studentCount}</strong> học sinh
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Warning */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lưu ý</AlertTitle>
                <AlertDescription>
                  Hệ thống sẽ tạo nghĩa vụ thanh toán cho tất cả học sinh trong nhóm.
                  Các nghĩa vụ đã tồn tại sẽ không bị trùng lặp.
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
                  <span>Đang tạo nghĩa vụ thanh toán...</span>
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
                      {progress.errors} lỗi trong quá trình tạo thanh toán
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
                  <span>Hoàn thành tạo nghĩa vụ thanh toán</span>
                </CardTitle>
                <CardDescription>
                  Đã tạo thành công {progress.generatedSummaries.length} nghĩa vụ thanh toán
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600">
                      {progress.generatedSummaries.length}
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
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        progress.generatedSummaries.reduce((sum, item) => sum + item.total_amount_due, 0)
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Tổng tiền</p>
                  </div>
                </div>

                {/* Generated Items List */}
                {progress.generatedSummaries.length > 0 && (
                  <div className="space-y-2">
                    <Label>Danh sách nghĩa vụ được tạo</Label>
                    <ScrollArea className="h-32 border rounded-md p-3">
                      <div className="space-y-2">
                        {progress.generatedSummaries.map((summary, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{summary.student_name}</span>
                            <span className="text-muted-foreground">
                              {formatCurrency(summary.total_amount_due)}
                            </span>
                          </div>
                        ))}
                      </div>
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
                            <strong>{error.studentName}:</strong> {error.error}
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
                disabled={!selectedGroupId || generationLoading}
                className="flex items-center space-x-2"
              >
                <DollarSign className="h-4 w-4" />
                <span>Tạo nghĩa vụ thanh toán</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};