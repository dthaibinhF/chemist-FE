// Export tất cả các service
export { academicYearService } from "./academic-year.service";
export { attendanceService } from "./attendance-service";
export { dashboardService } from "./dashboard.service";
export { feeService } from "./fee.service";
export { gradeService } from "./grade.service";
export { groupService } from "./group.service";
export { groupSessionsService } from "./group-sessions.service";
export { paymentService } from "./payment.service";
export { roleService } from "./role.service";
export { roomService } from "./room.service";
export { salaryService } from "./salary.service";
export { schoolClassService } from "./school-class.service";
export { schoolService } from "./school.service";
export { studentService } from "./student.service";
export { teacherService } from "./teacher.service";
export { timeTableService } from "./time-table.service";

// Export types
export type {
  AcademicYear,
  Attendance,
  BulkAttendanceDTO,
  DashboardStats,
  Fee,
  Grade,
  Group,
  GroupSession,
  PaginatedResponse,
  Role,
  Room,
  SalaryConfigurationDTO,
  SalaryCalculationParams,
  SalaryHistoryParams,
  SalarySummariesParams,
  SalaryType,
  Schedule,
  School,
  SchoolClass,
  Student,
  StudentSearchParams,
  Teacher,
  TeacherMonthlySummary,
  TeacherSearchParams,
} from "@/types/api.types";
