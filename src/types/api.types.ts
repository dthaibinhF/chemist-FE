// School types
export interface School {
    id?: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
}

// School Class types
export interface SchoolClass {
    id?: number;
    name: string;
    schoolId?: number;
    school?: School;
}

// Grade types
export interface Grade {
    id?: number;
    name: string;
    description?: string;
}

// Role types
export interface Role {
    id?: number;
    name: string;
    description?: string;
}

// Academic Year types
export interface AcademicYear {
    id?: number;
    name: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
}

// Fee types
export interface Fee {
    id?: number;
    name: string;
    amount: number;
    description?: string;
    academicYearId?: number;
    academicYear?: AcademicYear;
}

// Group types
export interface Group {
    id?: number;
    name: string;
    description?: string;
    academicYearId?: number;
    academicYear?: AcademicYear;
    gradeId?: number;
    grade?: Grade;
    teacherId?: number;
    roomId?: number;
    room?: Room;
    maxStudents?: number;
    currentStudents?: number;
}

export interface GroupList {
    id?: number;
    name: string;
    description?: string;
    academicYearName?: string;
    gradeName?: string;
    teacherName?: string;
    roomName?: string;
    maxStudents?: number;
    currentStudents?: number;
}

// Room types
export interface Room {
    id?: number;
    name: string;
    capacity?: number;
    description?: string;
} 