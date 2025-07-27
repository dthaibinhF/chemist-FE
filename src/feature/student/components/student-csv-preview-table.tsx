import { cn } from '@/lib/utils';
import React, { memo, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Import shared types
import type { CSVStudentRow, StudentPreview } from './csv-utils';

interface StudentPreviewTableProps {
  students: StudentPreview[];
  headers: string[];
  onCellChange: (rowIndex: number, header: keyof CSVStudentRow, value: string) => void;
  onSave: () => void;
  hasErrors: boolean;
}

// Row component for virtualized list
interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    students: StudentPreview[];
    headers: string[];
    onCellChange: (rowIndex: number, header: keyof CSVStudentRow, value: string) => void;
  };
}

// Optimized row component with memo and simplified inputs
const VirtualizedRow = memo(({ index, style, data }: RowProps) => {
  const { students, headers, onCellChange } = data;
  const student = students[index];

  // Memoize the cell change handler for this specific row
  const handleCellChange = useCallback(
    (header: keyof CSVStudentRow, value: string) => {
      onCellChange(student.rowIndex, header, value);
    },
    [onCellChange, student.rowIndex]
  );

  // Render simple input for all fields to improve performance
  const renderInputField = useCallback((header: keyof CSVStudentRow) => {
    const value = student.data[header] || '';
    const error = student.errors[header];

    let placeholder = '';
    let inputType = 'text';

    switch (header) {
      case 'name':
        placeholder = 'Tên học sinh';
        break;
      case 'parent_phone':
        placeholder = 'Số điện thoại';
        inputType = 'tel';
        break;
      case 'school':
        placeholder = 'Trường học (AK, CVL, ...)';
        break;
      case 'grade':
        placeholder = 'Khối (10, 11, 12)';
        break;
      case 'school_class':
        placeholder = 'Lớp (10A1, 11B2)';
        break;
      case 'academic_year':
        placeholder = 'Năm học (2024)';
        break;
      case 'group_name':
        placeholder = 'Tên nhóm học (12NC1, 11VL2)';
        break;
    }

    return (
      <div className="w-full">
        <Input
          type={inputType}
          value={value}
          onChange={(e) => handleCellChange(header, e.target.value)}
          className="w-full bg-transparent p-1 border-none focus:ring-0 focus:ring-offset-0 text-sm"
          placeholder={placeholder}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }, [handleCellChange, student.data, student.errors]);

  return (
    <div style={style} className="flex border-b">
      {headers.map((header) => {
        const error = student.errors[header as keyof CSVStudentRow];
        return (
          <div
            key={`${student.rowIndex}-${header}`}
            className={cn(
              "flex-1 min-w-[160px] max-w-[200px] p-2 border-r text-sm",
              error ? 'bg-red-50' : ''
            )}
          >
            {renderInputField(header as keyof CSVStudentRow)}
          </div>
        );
      })}
    </div>
  );
});

VirtualizedRow.displayName = 'VirtualizedRow';

export const StudentPreviewTable = memo(({ students, headers, onCellChange, onSave, hasErrors }: StudentPreviewTableProps) => {
  // Use virtualization for datasets larger than 20 students (lowered threshold for better performance)
  const shouldVirtualize = students.length > 20;

  if (students.length === 0) return null;

  // Memoize the optimized cell change handler
  const optimizedOnCellChange = useCallback(
    (rowIndex: number, header: keyof CSVStudentRow, value: string) => {
      onCellChange(rowIndex, header, value);
    },
    [onCellChange]
  );

  // Memoize list data to prevent unnecessary re-renders
  const listData = useMemo(() => ({
    students,
    headers,
    onCellChange: optimizedOnCellChange,
  }), [students, headers, optimizedOnCellChange]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle>Bước 3: Kiểm tra và xác nhận dữ liệu ({students.length} học sinh)</CardTitle>
        <CardDescription>
          Kiểm tra lại dữ liệu đã được đọc từ tệp. Chỉnh sửa trực tiếp trên bảng nếu cần thiết.
          Các ô màu đỏ là dữ liệu không hợp lệ.
          {shouldVirtualize && " Sử dụng cuộn ảo để hiển thị nhanh hơn với nhiều dữ liệu."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="relative w-full border rounded-md flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex bg-background border-b sticky top-0 z-10 flex-shrink-0">
            {headers.map((header) => (
              <div key={header} className="flex-1 min-w-[160px] max-w-[200px] p-2 border-r font-medium text-sm">
                {header}
              </div>
            ))}
          </div>

          {/* Body - Use virtualization for large datasets */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {shouldVirtualize ? (
              <List
                height={400}
                width="100%"
                itemCount={students.length}
                itemSize={50} // Reduced from 60 to 50 for better density
                itemData={listData}
                overscanCount={5} // Add overscan for smoother scrolling
              >
                {VirtualizedRow}
              </List>
            ) : (
              <div className="h-full overflow-auto">
                {students.map((student, index) => (
                  <VirtualizedRow
                    key={student.rowIndex}
                    index={index}
                    style={{}}
                    data={listData}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-end flex-shrink-0">
          <Button onClick={onSave} disabled={hasErrors}>
            Lưu {students.length} học sinh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

StudentPreviewTable.displayName = 'StudentPreviewTable';