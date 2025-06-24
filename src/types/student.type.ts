export type Score = {
    id?: number;
    examId: number;
    examName: string;
    studentId: number;
    studentName: string;
    score: number;
    description: string;
};

export type Attendance = {
    id?: number;
    scheduleId: number;
    groupId: number;
    groupName: string;
    studentId: number;
    studentName: string;
    status: string;
    description: string;
};

export type PaymentDetail = {
    id?: number;
    feeId: number;
    feeName: string;
    studentId: number;
    studentName: string;
    payMethod: string;
    amount: number; // BigDecimal -> number
    description: string;
    haveDiscount: number; // BigDecimal -> number
};

export type StudentDetail = {
    id?: number;
    group_id: number;
    group_name: string;
    school?: any; // School type chưa định nghĩa
    schoolClass?: any; // SchoolClass type chưa định nghĩa
    academicYear?: any; // AcademicYear type chưa định nghĩa
    grade?: any; // Grade type chưa định nghĩa
    studentId: number;
    studentName: string;
};

export type Student = {
    id: number;
    name: string;
    parentPhone: string;
    scores?: Score[];
    attendances?: Attendance[];
    paymentDetails?: PaymentDetail[];
    studentDetails?: StudentDetail[];
}; 