export interface BaseDTO {
  id?: number; // Union becasue when create new object, ID not needed
  create_at?: Date;
  update_at?: Date;
  end_at?: Date;
}

// Timezone-aware type definitions
// All dates from API are in UTC and should be converted to local Vietnam time (GMT+7) for display
// All dates sent to API should be converted from local Vietnam time to UTC

/**
 * UTC date string - dates from server in ISO format (e.g., "2024-01-15T08:00:00Z")
 * Should be converted to local time for display using timezone utilities
 */
export type UTCDateString = string;

/**
 * Local date string - dates from server in ISO format (e.g., "2024-01-15T08:00:00+07:00")
 * Represents date in local Vietnam timezone (GMT+7)
 */
export type LocalDateString = string;

/**
 * API OffsetDateTime string - datetime from Schedule API with timezone offset
 * Format: "2025-07-25T08:00:00+07:00" (ISO 8601 with timezone offset)
 * Used for Schedule API which sends dates with explicit timezone information
 */
export type ApiOffsetDateTime = string;

/**
 * UTC time string - time from server in HH:mm:ss format (e.g., "08:00:00")  
 * Represents time in UTC timezone, should be converted to local time for display
 */
export type UTCTimeString = string;

/**
 * Local time string - time in HH:mm:ss format for form inputs
 * Represents time in local Vietnam timezone (GMT+7)
 */
export type LocalTimeString = string;

export interface Account extends BaseDTO {
  name: string;
  email: string;
  phone: string;
  role_id: number;
  role_name: string;
}

export interface AcademicYear extends BaseDTO {
  year: string;
}

// School types
export interface School extends BaseDTO {
  name: string;
}

// School Class types
export interface SchoolClass extends BaseDTO {
  name: string;
}

// Grade types
export interface Grade extends BaseDTO {
  name: string;
}

// Role types
export interface Role extends BaseDTO {
  name: string;
}

export interface PaymentDetail extends BaseDTO {
  fee_id: number;
  fee_name: string;
  student_id: number;
  student_name: string;
  pay_method: string;
  amount: number;
  description: string;
  have_discount: number;
  payment_status: PaymentStatus;
  due_date: Date;
  generated_amount: number;
  is_overdue: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface StudentPaymentSummary extends BaseDTO {
  student_id: number;
  student_name: string;
  fee_id: number;
  fee_name: string;
  academic_year_id: number;
  academic_year_name: string;
  group_id: number;
  group_name: string;
  total_amount_due: number;
  total_amount_paid: number;
  outstanding_amount: number;
  payment_status: PaymentStatus;
  due_date: Date;
  enrollment_date: Date;
  completion_rate: number;
  is_overdue: boolean;
  is_fully_paid: boolean;
}

// Fee types
export interface Fee extends BaseDTO {
  name: string;
  description?: string;
  amount: number;
  start_time: Date;
  end_time: Date;
  payment_details: PaymentDetail[];
}

export interface GroupSchedule extends BaseDTO {
  group_id?: number;
  group_name?: string;
  day_of_week: string;
  start_time: LocalTimeString;
  end_time: LocalTimeString;
  room_id?: number;
  room_name?: string;
}

export interface Attendance extends BaseDTO {
  schedule_id: number;
  group_id: number;
  group_name: string;
  student_id: number;
  student_name: string;
  status: string;
  description: string;
}

export interface TeacherDetail extends BaseDTO {
  teacher_id: number;
  teacher_name: string;
  school: School;
  school_class: SchoolClass;
}
export interface Teacher extends BaseDTO {
  account: Account;
  teacher_details: TeacherDetail[];
  schedules?: Schedule[];
  salary_type: string;
  base_rate: number;
  monthly_summaries: TeacherMonthlySummary[];
}

export interface Schedule extends BaseDTO {
  group_id: number;
  group_name: string;
  start_time: LocalDateString;
  end_time: LocalDateString;
  delivery_mode: string;
  meeting_link: string;
  attendances: Attendance[];
  teacher_id: number;
  teacher_name: string;
  room: Room;
}

// Group types
export interface Group extends BaseDTO {
  name: string;
  level: "REGULAR" | "ADVANCED" | "VIP";
  fee_id: number;
  fee_name: string;
  academic_year_id: number;
  academic_year: string;
  grade_id: number;
  grade_name: string;
  group_schedules?: GroupSchedule[];
  schedules?: Schedule[];
  student_details?: StudentDetail[];
}

// Room types
export interface Room extends BaseDTO {
  name: string;
  location: string;
  capacity: number;
}

export interface Exam extends BaseDTO {
  name: string;
  description: string;
  type: string;
  test_date: Date;
  scores: Score[];
}

export interface Score extends BaseDTO {
  exam_id: number;
  exam_name: string;
  student_id: number;
  student_name: string;
  score: number;
  description: string;
}

export interface Student extends BaseDTO {
  name: string;
  parent_phone?: string;
  scores?: Score[];
  attendances?: Attendance[];
  payment_details?: PaymentDetail[];
  student_details?: StudentDetail[];
}

export interface StudentDetail extends BaseDTO {
  group_id?: number;
  group_name?: string;
  school?: School;
  class?: SchoolClass;
  academic_year?: AcademicYear;
  grade?: Grade;
  student_id?: number;
  student_name?: string;
}

export interface GroupSession extends BaseDTO {
  session_type: string;
  date: Date;
  start_time: string;
  end_time: string;
  group_ids: number[];
}

export interface GroupStats {
  totalGroups: number;
  activeGroups: number;
  totalStudents: number;
}

// Dashboard Statistics
export interface DashboardStats {
  total_students: number;
  active_students: number;
  total_teachers: number;
  active_teachers: number;
  total_groups: number;
  active_groups: number;
  total_schedules: number;
  this_week_schedules: number;
  total_attendances: number;
  attendance_rate_percentage: number;
}

// Search Parameters
export interface StudentSearchParams {
  page?: number;
  size?: number;
  sort?: string;
  studentName?: string;
  groupName?: string;
  schoolName?: string;
  className?: string;
  parentPhone?: string;
}

export interface TeacherSearchParams {
  page?: number;
  size?: number;
  sort?: string;
  teacherName?: string;
  phone?: string;
  email?: string;
  specialization?: string;
  total_count?: number;
}

// Bulk Attendance Operations
export interface AttendanceRecord {
  student_id: number;
  status: "PRESENT" | "ABSENT" | "LATE";
  description?: string;
}

export interface BulkAttendanceDTO {
  schedule_id: number;
  attendance_records: AttendanceRecord[];
}

// Pagination Response
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export enum PaymentStatus {
  PENDING = "PENDING",

  /**
   * Some amount has been paid but the full amount is still outstanding.
   * This occurs when the total paid amount is greater than 0 but less than the total due amount.
   */
  PARTIAL = "PARTIAL",

  /**
   * The payment has been completed in full.
   * This occurs when the total paid amount equals or exceeds the total due amount.
   */
  PAID = "PAID",

  /**
   * The payment is past its due date and has not been paid in full.
   * This status is automatically set by the system when checking for overdue payments.
   */
  OVERDUE = "OVERDUE"
}


// Salary System Types
export enum SalaryType {
  PER_LESSON = "PER_LESSON",
  FIXED = "FIXED"
}

export interface TeacherMonthlySummary extends BaseDTO {
  teacher_id: number;
  teacher_name: string;
  month: number; // 1-12
  year: number; // 2020-2100
  scheduled_lessons: number;
  completed_lessons: number;
  completion_rate: number; // 0.0000-1.0000
  rate_per_lesson: number;
  base_salary: number;
  performance_bonus: number;
  total_salary: number;
}

export interface SalaryConfigurationDTO {
  salaryType: SalaryType;
  baseRate: number;
}

export interface SalaryCalculationParams {
  month: number; // 1-12
  year: number; // 2020-2100
}

export interface SalaryHistoryParams {
  fromYear: number;
  fromMonth: number;
  toYear: number;
  toMonth: number;
}

export interface SalarySummariesParams {
  page?: number;
  size?: number;
  sort?: string[];
}

// Financial Dashboard & Statistics Types
export interface FinancialStatisticsDTO {
  total_revenue: number;
  total_outstanding: number;
  total_amount_due: number;
  collection_rate: number;            // Percentage 0-100
  pending_payments_count: number;
  partial_payments_count: number;
  paid_payments_count: number;
  overdue_payments_count: number;
  overdue_amount: number;
  current_month_revenue: number;
  previous_month_revenue: number;
  monthly_growth_rate: number;        // Percentage
  average_payment_amount: number;
  total_transactions: number;
  active_students_count: number;
  student_participation_rate: number; // Percentage 0-100
}

export interface OverdueStatisticsDTO {
  totalOverdueAmount: number;
  overduePaymentSummariesCount: number;
  overduePaymentDetailsCount: number;
  uniqueStudentsWithOverduePayments: number;
  asOfDate: string;
}

// Enhanced Payment Types for Search and Filtering
export interface PaymentSearchParams {
  startDate?: string;
  endDate?: string;
  status?: PaymentStatus;
  studentId?: number;
  feeId?: number;
}

export interface BulkPaymentGenerationDTO {
  groupId: number;
  academicYearId: number;
}

export interface PaymentWithSummaryUpdateDTO extends Omit<PaymentDetail, 'id'> {
  academicYearId: number;
  groupId: number;
}

// Add bulk schedule request/response types
export interface BulkScheduleRequest {
  group_ids: number[];
  start_date: string;
  end_date: string;
}

export interface BulkScheduleResponse {
  success: boolean;
  message: string;
  total_groups_processed: number;
  successful_groups: number;
  failed_groups: number;
  total_schedules_generated: number;
  generated_schedules: Schedule[][];
  errors: string[];
}

// Add update mode types for future schedule updates
export enum ScheduleUpdateMode {
  SINGLE_OCCURRENCE = "SINGLE_OCCURRENCE",
  ALL_FUTURE_OCCURRENCES = "ALL_FUTURE_OCCURRENCES"
}

export interface ScheduleUpdateModeRequest {
  update_mode: ScheduleUpdateMode;
  start_time: string;
  end_time: string;
  delivery_mode: string;
  teacher_id?: number;
  room_id?: number;
  meeting_link?: string;
}