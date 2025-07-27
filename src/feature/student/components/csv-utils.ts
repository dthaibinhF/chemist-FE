import { z } from 'zod';
import type { Group } from '@/types/api.types';
import { groupService } from '@/service';

// CSV Template Structure - Fixed column names
export interface CSVStudentRow {
  name: string;           // Required
  parent_phone?: string;  // Optional
  school?: string;        // Optional
  grade?: string;         // Optional
  school_class?: string;  // Optional
  academic_year?: string; // Optional
  group_name?: string;    // Optional - Changed from group_id to group_name
}

// Represents a row from the CSV for preview
export interface StudentPreview {
  data: CSVStudentRow;
  errors: Partial<Record<keyof CSVStudentRow, string>>;
  rowIndex: number;
}

// Template columns with descriptions
export const CSV_TEMPLATE_COLUMNS = {
  name: { required: true, description: 'Tên học sinh (bắt buộc)' },
  parent_phone: { required: false, description: 'Số điện thoại phụ huynh' },
  school: { required: false, description: 'Tên trường học hoặc viết tắt (VD: AK, CVL)' },
  grade: { required: false, description: 'Khối lớp (VD: 10, 11, 12)' },
  school_class: { required: false, description: 'Lớp học (VD: 10A1, 11B2)' },
  academic_year: { required: false, description: 'Năm học (VD: 2024)' },
  group_name: { required: false, description: 'Tên nhóm học chính xác (VD: "12NC1", "11VL2") - phải trùng khớp hoàn toàn' },
} as const;

// Enhanced mapping for abbreviated school names 
// Updated based on database query results and common abbreviations
export const SCHOOL_MAPPING: Record<string, string> = {
  // Common abbreviations
  'AK': 'Trường THPT An Khánh',
  'CVL': 'Trường THPT Châu Văn Liêm',
  'NVD': 'Trường THPT Nguyễn Việt Dũng',
  'NVH': 'Trường THPT Nguyễn Việt Hồng',
  'PNH': 'Trường THPT Phan Ngọc Hiển',
  'BHN': 'Trường THPT Bùi Hữu Nghĩa',
  'BM': 'Trường THPT Bình Minh',
  'LTT': 'Trường THPT Lý Tự Trọng',
  'LHP': 'Trường THPT Lưu Hữu Phước',
  'NS': 'Trường THPT Ngã Sáu',
  'THSP': 'Trường THPT Thực Hành Sư Phạm',
  'TĐN': 'Trường THPT Trần Đại Nghĩa',
  'TDN': 'Trường THPT Trần Đại Nghĩa',
  'NBK': 'Trường THPT Nguyễn Bình Khiêm',
  'TSTD': 'Thí Sinh Tự Do',
  'PVT': 'Trường THPT Phan Văn Trị',
  'TV': 'Trường THPT Tầm Vu',
  'SP': 'Trường THPT Song Phú',
  'GX': 'Trường THPT Giai Xuân',
  'ALT': 'Trường THPT An Lạc Thôn',
  'TL': 'Trường THPT Thới Lai',
  'QTHB': 'Trường THPT Quốc Tế Hòa Bình',
  'CTA': 'Trường THPT Châu Thành A',
  'VL': 'Trường THPT Vĩnh Long',
  'MV': 'Trường THPT Mang Thít',
  'VT': 'Trường THPT Vũng Tàu',
  'BT': 'Trường THPT Bà Rịa',

  // Partial names (case-insensitive matching)
  'AN KHÁNH': 'Trường THPT An Khánh',
  'CHÂU VĂN LIÊM': 'Trường THPT Châu Văn Liêm',
  'NGUYỄN VIỆT DŨNG': 'Trường THPT Nguyễn Việt Dũng',
  'NGUYỄN VIỆT HỒNG': 'Trường THPT Nguyễn Việt Hồng',
  'PHAN NGỌC HIỂN': 'Trường THPT Phan Ngọc Hiển',
  'BÙI HỮU NGHĨA': 'Trường THPT Bùi Hữu Nghĩa',
  'BÌNH MINH': 'Trường THPT Bình Minh',
  'LÝ TỰ TRỌNG': 'Trường THPT Lý Tự Trọng',
  'LƯU HỮU PHƯỚC': 'Trường THPT Lưu Hữu Phước',
  'NGÃ SÁU': 'Trường THPT Ngã Sáu',
  'THỰC HÀNH SƯ PHẠM': 'Trường THPT Thực Hành Sư Phạm',
  'TRẦN ĐẠI NGHĨA': 'Trường THPT Trần Đại Nghĩa',
  'NGUYỄN BÌNH KHIÊM': 'Trường THPT Nguyễn Bình Khiêm',
  'PHAN VĂN TRỊ': 'Trường THPT Phan Văn Trị',
  'TẦM VU': 'Trường THPT Tầm Vu',
  'SONG PHÚ': 'Trường THPT Song Phú',
  'GIAI XUÂN': 'Trường THPT Giai Xuân',
  'AN LẠC THÔN': 'Trường THPT An Lạc Thôn',
  'THỚI LAI': 'Trường THPT Thới Lai',
  'QUỐC TẾ HÒA BÌNH': 'Trường THPT Quốc Tế Hòa Bình',
  'CHÂU THÀNH A': 'Trường THPT Châu Thành A',
  'THÍ SINH TỰ DO': 'Thí Sinh Tự Do',

  // Full names for exact matching
  'Trường THPT An Khánh': 'Trường THPT An Khánh',
  'Trường THPT Châu Văn Liêm': 'Trường THPT Châu Văn Liêm',
  'Trường THPT Nguyễn Việt Dũng': 'Trường THPT Nguyễn Việt Dũng',
  'Trường THPT Nguyễn Việt Hồng': 'Trường THPT Nguyễn Việt Hồng',
  'Trường THPT Phan Ngọc Hiển': 'Trường THPT Phan Ngọc Hiển',
  'Trường THPT Bùi Hữu Nghĩa': 'Trường THPT Bùi Hữu Nghĩa',
  'Trường THPT Bình Minh': 'Trường THPT Bình Minh',
  'Trường THPT Lý Tự Trọng': 'Trường THPT Lý Tự Trọng',
  'Trường THPT Lưu Hữu Phước': 'Trường THPT Lưu Hữu Phước',
  'Trường THPT Ngã Sáu': 'Trường THPT Ngã Sáu',
  'Trường THPT Thực Hành Sư Phạm': 'Trường THPT Thực Hành Sư Phạm',
  'Trường THPT Trần Đại Nghĩa': 'Trường THPT Trần Đại Nghĩa',
  'Trường THPT Nguyễn Bình Khiêm': 'Trường THPT Nguyễn Bình Khiêm',
  'Trường THPT Phan Văn Trị': 'Trường THPT Phan Văn Trị',
  'Trường THPT Tầm Vu': 'Trường THPT Tầm Vu',
  'Trường THPT Song Phú': 'Trường THPT Song Phú',
  'Trường THPT Giai Xuân': 'Trường THPT Giai Xuân',
  'Trường THPT An Lạc Thôn': 'Trường THPT An Lạc Thôn',
  'Trường THPT Thới Lai': 'Trường THPT Thới Lai',
  'Trường THPT Quốc Tế Hòa Bình': 'Trường THPT Quốc Tế Hòa Bình',
  'Trường THPT Châu Thành A': 'Trường THPT Châu Thành A',
  'Thí Sinh Tự Do': 'Thí Sinh Tự Do',
};

// Zod schema for file upload
export const fileSchema = z.object({
  file: z
    .instanceof(File, { message: 'Vui lòng chọn một tệp.' })
    .refine((file) => file.size > 0, { message: 'Tệp không được để trống.' })
    .refine((file) => file.type === 'text/csv' || file.name.endsWith('.csv'), {
      message: 'Chỉ chấp nhận tệp có định dạng .csv.',
    }),
});

// Zod schema for CSV template validation
export const csvStudentRowSchema = z.object({
  name: z.string().min(1, 'Tên học sinh không được để trống'),
  parent_phone: z.string().optional(),
  school: z.string().optional(),
  grade: z.string().optional(),
  school_class: z.string().optional(),
  academic_year: z.string().optional(),
  group_name: z.string().optional(),
});

// Helper function to map school abbreviations to full names
export const mapSchoolName = (schoolValue: string): string => {
  if (!schoolValue) return '';

  const trimmedValue = schoolValue.trim();
  const upperSchoolValue = trimmedValue.toUpperCase();

  // Try direct mapping first
  if (SCHOOL_MAPPING[upperSchoolValue]) {
    return SCHOOL_MAPPING[upperSchoolValue];
  }

  // Try abbreviation without spaces
  const abbreviation = upperSchoolValue.split(' ').join('');
  if (SCHOOL_MAPPING[abbreviation]) {
    return SCHOOL_MAPPING[abbreviation];
  }

  // Try original value as-is
  if (SCHOOL_MAPPING[trimmedValue]) {
    return SCHOOL_MAPPING[trimmedValue];
  }

  // Return original value if no mapping found
  return trimmedValue;
};

// Helper function to validate group name using exact search API
export const validateGroupName = async (groupName: string): Promise<{ group?: Group; error?: string }> => {
  if (!groupName || !groupName.trim()) {
    return {}; // Empty group name is allowed (optional field)
  }

  try {
    const group = await groupService.getGroupByName(groupName.trim());
    return { group };
  } catch (error: any) {
    // API returns error for non-exact matches or not found
    if (error.response?.status === 404) {
      return { error: `Nhóm "${groupName}" không tìm thấy. Vui lòng nhập chính xác tên nhóm.` };
    } else if (error.response?.status === 400) {
      return { error: `Có nhiều nhóm chứa "${groupName}". Vui lòng nhập tên chính xác (VD: ${groupName}1, ${groupName}2).` };
    } else {
      return { error: `Lỗi khi tìm kiếm nhóm "${groupName}".` };
    }
  }
};

// Batch validate multiple group names with concurrency limit
export const validateGroupNamesBatch = async (groupNames: string[]): Promise<Map<string, { group?: Group; error?: string }>> => {
  const results = new Map<string, { group?: Group; error?: string }>();
  const uniqueGroupNames = [...new Set(groupNames.filter(name => name && name.trim()))];

  const BATCH_SIZE = 5; // Process 5 groups at a time to avoid overwhelming the server

  for (let i = 0; i < uniqueGroupNames.length; i += BATCH_SIZE) {
    const batch = uniqueGroupNames.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(async (groupName) => {
      const result = await validateGroupName(groupName);
      return { groupName, result };
    });

    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(({ groupName, result }) => {
      results.set(groupName, result);
    });
  }

  return results;
};

// Generate CSV template content
export const generateCSVTemplate = (): string => {
  const headers = Object.keys(CSV_TEMPLATE_COLUMNS);
  const sampleData = [
    'Nguyễn Văn A,0123456789,AK,12,12A1,2024,12NC1',
    'Trần Thị B,0987654321,CVL,11,11B2,2024,11VL2',
    'Lê Văn C,,NVD,10,10A3,2024,10TK3'
  ];

  return [headers.join(','), ...sampleData].join('\n');
};

// Download CSV template file
export const downloadCSVTemplate = () => {
  const csvContent = generateCSVTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'student-import-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Helper function to validate CSV headers against template
export const validateCsvHeaders = (headers: string[]): { valid: boolean; warnings: string[]; errors: string[] } => {
  const warnings: string[] = [];
  const errors: string[] = [];
  const expectedHeaders = Object.keys(CSV_TEMPLATE_COLUMNS);

  // Check if 'name' column exists (required)
  if (!headers.includes('name')) {
    errors.push('Cột "name" là bắt buộc. Vui lòng tải template mới và sử dụng đúng định dạng.');
  }

  // Check for unexpected headers
  const unexpectedHeaders = headers.filter(header => !expectedHeaders.includes(header));
  if (unexpectedHeaders.length > 0) {
    warnings.push(`Các cột không đúng template sẽ bị bỏ qua: ${unexpectedHeaders.join(', ')}`);
  }

  // Check for duplicate headers
  const uniqueHeaders = new Set(headers);
  if (uniqueHeaders.size !== headers.length) {
    errors.push('Tệp CSV có các cột trùng tên');
  }

  // Check for empty headers
  const emptyHeaders = headers.filter(header => !header.trim());
  if (emptyHeaders.length > 0) {
    errors.push('Tệp CSV có các cột không có tên');
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
};

// Helper function to validate a single student row
export const validateStudentRow = (
  row: Partial<CSVStudentRow>,
  index: number,
  defaults: {
    school: string;
    grade: string;
    schoolClass: string;
    academicYear: string;
    groupName: string;
  },
): StudentPreview => {
  // Apply defaults if values are empty
  const dataWithDefaults: CSVStudentRow = {
    name: row.name || '',
    parent_phone: row.parent_phone || undefined,
    school: row.school || defaults.school || undefined,
    grade: row.grade || defaults.grade || undefined,
    school_class: row.school_class || defaults.schoolClass || undefined,
    academic_year: row.academic_year || defaults.academicYear || undefined,
    group_name: row.group_name || defaults.groupName || undefined,
  };

  // Process school abbreviations
  if (dataWithDefaults.school) {
    dataWithDefaults.school = mapSchoolName(dataWithDefaults.school);
  }

  // Validate the row with Zod schema
  const validationResult = csvStudentRowSchema.safeParse(dataWithDefaults);
  const errors: Partial<Record<keyof CSVStudentRow, string>> = {};

  if (!validationResult.success) {
    validationResult.error.issues.forEach((issue: z.ZodIssue) => {
      const fieldName = issue.path[0] as keyof CSVStudentRow;
      errors[fieldName] = issue.message;
    });
  }

  // Note: Group name validation will be done asynchronously during save
  // We'll add a placeholder here for now, actual validation happens in handleSave

  return {
    data: dataWithDefaults,
    errors,
    rowIndex: index,
  };
};

// Simple debounce utility function
export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}