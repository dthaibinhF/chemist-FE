export interface BaseDTO {
    id?: number;
    created_at: Date;
    updated_at: Date;
}

export interface Account extends BaseDTO{
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
    address?: string;
}

// School Class types
export interface SchoolClass extends BaseDTO{
    name: string;
}

// Grade types
export interface Grade extends BaseDTO{
    name: string;
}

// Role types
export interface Role extends BaseDTO{
    name: string;
}

export interface PaymentDetail extends BaseDTO{
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
export interface Fee extends BaseDTO{
    name: string;
    description?: string;
    amount: number;
    start_time: Date;
    end_time: Date;
    payment_details: PaymentDetail[];
}

export interface GroupSchedule extends BaseDTO{
    group_id: number;
    group_name: string;
    day_of_week: string;
    start_time: Date;
    end_time: Date;
}

export interface Attendance extends BaseDTO{
    schedule_id: number;
    group_id: number;
    group_name: string;
    student_id: number;
    student_name: string;
    status: string;
    description: string;
}

export interface TeacherDetail extends BaseDTO{
    teacher_id: number;
    teacher_name: string;
    school: School;
    school_class: SchoolClass;
}
export interface Teacher extends BaseDTO{
    account: Account;
    teacher_details: TeacherDetail[];
}
export interface Schedule extends BaseDTO{
    group_id: number;
    group_name: string;
    start_time: Date;
    end_time: Date;
    delivery_mode: string;
    meeting_link: string;
    attendances: Attendance[];
    teacher: Teacher;
    room: Room;
}

export interface StudentDetail extends BaseDTO{
    group_id: number;
    group_name: string;
    school: School;
    school_class: SchoolClass;
    academic_year: AcademicYear;
    grade: Grade;
    student_id: number;
    student_name: string;
}

// Group types
export interface Group extends BaseDTO{
    name: string;
    level: string;
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
export interface Room extends BaseDTO{
    name: string;
    location: string;
    capacity: number;
} 

export interface Exam extends BaseDTO{
    name: string;
    description: string;
    type: string;
    test_date: Date;
    scores: Score[];
}

export interface Score extends BaseDTO{
    exam_id: number;
    exam_name: string;
    student_id: number;
    student_name: string;
    score: number;
    description: string;
}

export interface Student extends BaseDTO{
    name: string;
    parent_phone: string;
    scores: Score[];
    attendances: Attendance[];
    payment_details: PaymentDetail[];
    student_details: StudentDetail[];
}



export interface GroupSession extends BaseDTO{
    session_type: string;
    date: Date;
    start_time: Date;
    end_time: Date;
    group_ids: number[];
}