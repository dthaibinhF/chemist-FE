// Export tất cả các service
export { schoolService } from "./school.service";
export { schoolClassService } from "./school-class.service";
export { gradeService } from "./grade.service";
export { roleService } from "./role.service";
export { academicYearService } from "./academic-year.service";
export { feeService } from "./fee.service";
export { groupService } from "./group.service";
export { roomService } from "./room.service";

// Export types
export type {
    School,
    SchoolClass,
    Grade,
    Role,
    AcademicYear,
    Fee,
    Group,
    GroupList,
    Room,
} from "@/types/api.types"; 