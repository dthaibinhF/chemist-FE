import { StudentDetail } from "@/types/api.types";

export const getCurrentStudentDetail = (studentDetails: StudentDetail[]) => {
  return studentDetails.filter(
    (detail) =>
      detail.end_at === null || (detail?.end_at && detail?.end_at > new Date())
  )[0];
};
