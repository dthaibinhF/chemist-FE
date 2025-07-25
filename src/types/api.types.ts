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
}

export interface Schedule extends BaseDTO {
  group_id: number;
  group_name: string;
  start_time: LocalDateString;
  end_time: LocalDateString;
  delivery_mode: string;
  meeting_link: string;
  attendances: Attendance[];
  teacher: Teacher;
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
  school_class?: SchoolClass;
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
