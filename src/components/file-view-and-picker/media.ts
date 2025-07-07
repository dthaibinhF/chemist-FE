export enum MediaType {
    IMAGE = 'image/*',
    PNG = 'image/png',
    JPEG = 'image/jpeg',
    JPG = 'image/jpg',
    GIF = 'image/gif',
    WEBP = 'image/webp',
    PDF = 'application/pdf',
    DOC = 'application/msword',
    DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    XLS = 'application/vnd.ms-excel',
    XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    PPT = 'application/vnd.ms-powerpoint',
    PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    TXT = 'text/plain',
    CSV = 'text/csv',
    VIDEO = 'video/mp4',
    MP4 = 'video/mp4',
    MP3 = 'audio/mpeg',
    ALL = 'image/jpeg,image/png,image/jpg,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/csv,video/mp4,audio/mpeg',
}
export interface Media {
    id?: string;
    type?: MediaType;
    url?: string | null;
    thumbnailUrl?: string | null;
    width?: number | null;
    height?: number | null;
    userId?: string | null;
    fileName?: string;
}


export interface IReferenceData {
    hometownProvinceList: string[];
    admissionMethodList: string[];
    highestLevelAwardList: string[];
    healthStatusList: string[];
    educationLevelList: string[];
    povertyCertificateList: string[];
}

export interface IFormSectionsResponse {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    form_id: string;
}

export interface IFormSubmitRequest {
    name: string;
    email: string;
    phone_number: string;
    university_id?: number;
    form_id: string;
}

export interface IFormSubmitResponse {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    created_at: string;
    form_id: string;
    status: string;
    university_id: number;
    final_scores: unknown[];
    total_final_score: number | null;
}

export interface IApplicationPreview {
    studentInfor: IStudentGeneralInfo;
    academicInfor: IStudentAcademicInfo;
    familyInfor: IStudentFamilyInfo;
    essayInfor: IStudentSpecialInfo;
    documentInfor: IStudentDocumentsPreview;
}

export interface IApplicationPayload {
    studentInfor: IStudentGeneralInfo;
    academicInfor: IStudentAcademicInfo;
    familyInfor: IStudentFamilyInfo;
    essayInfor: IStudentSpecialInfo;
    documentInfor: IStudentDocuments[];
}

export interface IStudentGeneralInfo {
    fullName?: string; // 'nguyen van a'
    gender?: boolean; // 'true'
    dateOfBirth?: string; // '2000-01-01'
    email?: string; // 'nguyenvana@gmail.com'
    emailStudent?: string; // 'nguyenvana@gmail.com'
    hometownProvince?: string; // 'Hà Nội'
    citizenIdNumber?: string; // '1234567890'
    phoneNumber?: string; // '0909090909'
    permanentAddress?: string; // '123 Đường ABC, Quận XYZ, Thành phố ABC'
    permanentProvinceCity?: string; // 'Hà Nội'
    temporaryAddress?: string; // '123 Đường ABC, Quận XYZ, Thành phố ABC'
    major?: string; // 'Công nghệ thông tin'
    className?: string; // 'K66'
    studentCode?: string; // '1234567890'
    isPartTimeJob?: boolean; // 'false'
    partTimeJob?: string; // 'Công ty ABC'
    partTimeIncome?: number; // 1000000
    universityId?: string; // 'uuid'
}

export interface IStudentContactAddress {
    permanent_address: string;
    current_address: string;
}

export interface IStudentAcademicInfo {
    admissionMethod: string; // Phương thức trúng tuyển đại học
    nationalExamTotalScore?: number; // Điểm thi tốt nghiệp THPT
    highSchoolExamTotalScore?: number; // Điểm học bạ
    abilityTestTotalScoreHCM?: number; // Điểm đánh giá năng lực ĐHQG HCM
    abilityTestTotalScoreHN?: number; // Điểm đánh giá năng lực ĐHQG HN
    totalScoreOfSubjectsInCombination?: number; // Điểm học bạ của tất cả các môn
    totalScoreOfSpecialGraduationAdmissionScore?: number; // Điểm đánh giá năng lực đặc biệt
    totalScoreOfVsat?: number; // Điểm VSAT
    averageScoreGrade10?: number; // Điểm trung bình của học sinh lớp 10
    averageScoreGrade11?: number; // Điểm trung bình của học sinh lớp 11
    averageScoreGrade12?: number; // Điểm trung bình của học sinh lớp 12
    awardHaveEarn?: string; // Danh sách giải thưởng
    highestLevelAward?: string; // Giải thưởng cao nhất - "Quận/Huyện/Thành phố trực thuộc Tỉnh"
    scholarshipHaveReceived?: string; // Danh sách học bổng đã nhận
    isHaveReferenceFromTeacher: boolean; // Có giấy giới thiệu từ giáo viên không
}

export interface IStudentFamilyInfo {
    parentsCurrentAddress: string; // "123 Đường ABC, Quận 1, TP.HCM"
    parentsMaritalStatus: string; // "Bình thường"
    povertyCertificate: string; // "Có giấy chứng nhận hộ nghèo"
    divorcedParentSupport: boolean; // false
    otherMemberDescription: string; // "Ông bà sống cùng"
    numberOfGrandparentLivingWith: number; // 2
    numberOfSiblingMarried: number; // 1
    numberOfUnmarriedSibling: number; // 2
    numberOfUnmarriedSiblingInEducate: number; // 1
    numberOfUnmarriedSiblingNotInEducateOrDoSmallJob: number; // 0
    numberOfUnmarriedSiblingInSpecificJob: number; // 0
    totalSiblingFromOtherField: number; // 0
    momName: string; // "Nguyễn Thị A"
    momYob: number; // 1970
    momHealthStatus: string; // "Bình thường"
    momHealthDescription: string; // "Bình thường"
    momJobTitle: string; // "Giáo viên"
    momEducationLevel: string; // "Tiểu học"
    momIncome: number; // 10000000
    dadName: string; // "Nguyễn Văn B"
    dadYob: number; // 1968
    dadHealthStatus: string; // "Bình thường"
    dadHealthDescription: string; // "Bình thường"
    dadJobTitle: string; // "Công nhân"
    dadEducationLevel: string; // "Tiểu học"
    dadIncome: number; // 12000000
}

export interface IStudentSpecialInfo {
    essayContentFirst: string; // "Bài luận số 1..."
    essayContentSecond: string; // "Bài luận số 2..."
}

export interface IStudentDocuments {
    portraitPhotoUrls: string[]; // "url"
    admissionLetterUrls: string[]; // "url"
    grade12TranscriptUrls: string[]; // "url"
    topAcademicAwardCertificateUrls: string[]; // "url"
    letterUrls: string[]; // "url"
    povertyCertificateUrls: string[]; // "url"
    foreignLanguageCertificateUrls: string[]; // "url"
}

export interface IStudentDocumentsPreview {
    portraitPhotoUrls: { url: string; fileName: string }[];
    admissionLetterUrls: { url: string; fileName: string }[];
    grade12TranscriptUrls: { url: string; fileName: string }[];
    topAcademicAwardCertificateUrls: { url: string; fileName: string }[];
    letterUrls: { url: string; fileName: string }[];
    povertyCertificateUrls: { url: string; fileName: string }[];
    foreignLanguageCertificateUrls: { url: string; fileName: string }[];
}
