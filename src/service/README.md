# API Services

Các service này được tạo để tương tác với backend API dựa trên các controller Java.

## Các Service Available

### 1. **School Service** (`school.service.ts`)
- `getAllSchools()` - Lấy tất cả trường học
- `getSchoolById(id)` - Lấy trường học theo ID
- `createSchool(school)` - Tạo trường học mới
- `updateSchool(id, school)` - Cập nhật trường học
- `deleteSchool(id)` - Xóa trường học

### 2. **School Class Service** (`school-class.service.ts`)
- `getAllSchoolClasses()` - Lấy tất cả lớp học
- `getSchoolClassById(id)` - Lấy lớp học theo ID
- `createSchoolClass(schoolClass)` - Tạo lớp học mới
- `updateSchoolClass(id, schoolClass)` - Cập nhật lớp học
- `deleteSchoolClass(id)` - Xóa lớp học

### 3. **Grade Service** (`grade.service.ts`)
- `getAllGrades()` - Lấy tất cả khối
- `getGradeById(id)` - Lấy khối theo ID
- `createGrade(grade)` - Tạo khối mới
- `updateGrade(id, grade)` - Cập nhật khối
- `deleteGrade(id)` - Xóa khối

### 4. **Role Service** (`role.service.ts`)
- `getAllRoles()` - Lấy tất cả vai trò
- `getRoleById(id)` - Lấy vai trò theo ID
- `createRole(role)` - Tạo vai trò mới
- `updateRole(id, role)` - Cập nhật vai trò
- `deleteRole(id)` - Xóa vai trò

### 5. **Academic Year Service** (`academic-year.service.ts`)
- `getAllAcademicYears()` - Lấy tất cả năm học
- `getAcademicYearById(id)` - Lấy năm học theo ID
- `createAcademicYear(academicYear)` - Tạo năm học mới
- `updateAcademicYear(id, academicYear)` - Cập nhật năm học
- `deleteAcademicYear(id)` - Xóa năm học

### 6. **Fee Service** (`fee.service.ts`)
- `getAllFees()` - Lấy tất cả phí
- `getFeeById(id)` - Lấy phí theo ID
- `createFee(fee)` - Tạo phí mới
- `updateFee(id, fee)` - Cập nhật phí
- `deleteFee(id)` - Xóa phí

### 7. **Group Service** (`group.service.ts`)
- `getAllGroups()` - Lấy tất cả nhóm (danh sách)
- `getAllGroupsWithDetail()` - Lấy tất cả nhóm với chi tiết
- `getGroupById(id)` - Lấy nhóm theo ID
- `getGroupsByAcademicYearId(academicYearId)` - Lấy nhóm theo năm học
- `getGroupsByGradeId(gradeId)` - Lấy nhóm theo khối
- `createGroup(group)` - Tạo nhóm mới
- `updateGroup(id, group)` - Cập nhật nhóm
- `deleteGroup(id)` - Xóa nhóm

### 8. **Room Service** (`room.service.ts`)
- `getAllRooms()` - Lấy tất cả phòng học
- `getRoomById(id)` - Lấy phòng học theo ID
- `createRoom(room)` - Tạo phòng học mới
- `updateRoom(id, room)` - Cập nhật phòng học
- `deleteRoom(id)` - Xóa phòng học

## Cách Sử Dụng

### Import Service
```typescript
import { schoolService, gradeService, groupService } from "@/service";
```

### Sử dụng trong Component
```typescript
import { useEffect, useState } from "react";
import { schoolService, type School } from "@/service";

const MyComponent = () => {
    const [schools, setSchools] = useState<School[]>([]);

    useEffect(() => {
        const loadSchools = async () => {
            try {
                const data = await schoolService.getAllSchools();
                setSchools(data);
            } catch (error) {
                console.error("Error loading schools:", error);
            }
        };
        
        loadSchools();
    }, []);

    return (
        <div>
            {schools.map(school => (
                <div key={school.id}>{school.name}</div>
            ))}
        </div>
    );
};
```

### Sử dụng với React Hook Form
```typescript
import { useForm } from "react-hook-form";
import { gradeService } from "@/service";

const MyForm = () => {
    const [grades, setGrades] = useState([]);
    
    useEffect(() => {
        gradeService.getAllGrades().then(setGrades);
    }, []);

    return (
        <Select>
            {grades.map(grade => (
                <SelectItem key={grade.id} value={grade.id}>
                    {grade.name}
                </SelectItem>
            ))}
        </Select>
    );
};
```

## Type Definitions

Tất cả các type được định nghĩa trong `@/types/api.types.ts`:

- `School` - Trường học
- `SchoolClass` - Lớp học
- `Grade` - Khối
- `Role` - Vai trò
- `AcademicYear` - Năm học
- `Fee` - Phí
- `Group` - Nhóm (chi tiết)
- `GroupList` - Nhóm (danh sách)
- `Room` - Phòng học

## Error Handling

Tất cả các service đều throw error khi API call thất bại. Bạn nên wrap trong try-catch:

```typescript
try {
    const data = await schoolService.getAllSchools();
    // Handle success
} catch (error) {
    // Handle error
    console.error("API Error:", error);
}
```

## Authentication

Tất cả các service đều sử dụng authentication tự động thông qua `api-client.ts`. Token sẽ được tự động thêm vào header và refresh khi cần thiết. 