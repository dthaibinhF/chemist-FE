// RESTful API Intent Mapping
// Dựa trên OpenAPI spec từ swagger.text

export interface ApiRequest {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  pathParams?: Record<string, any>;
  queryParams?: Record<string, any>;
  body?: any;
}

export interface IntentMapping {
  patterns: string[];
  request: ApiRequest;
  description: string;
  type?: "count" | "list";
}

// Mapping từ câu hỏi tự nhiên sang RESTful API request
export const INTENT_MAPPINGS: IntentMapping[] = [
  // === STUDENT (Học sinh) ===
  {
    patterns: ["bao nhiêu học sinh", "số lượng học sinh", "tổng số học sinh"],
    request: {
      endpoint: "/api/v1/student",
      method: "GET",
    },
    description: "Đếm số lượng học sinh",
    type: "count",
  },
  {
    patterns: [
      "liệt kê học sinh",
      "danh sách học sinh",
      "tất cả học sinh",
      "học sinh nào",
      "thống kê học sinh",
    ],
    request: {
      endpoint: "/api/v1/student",
      method: "GET",
    },
    description: "Lấy danh sách tất cả học sinh",
    type: "list",
  },
  {
    patterns: [
      "học sinh nhóm",
      "học sinh lớp",
      "học sinh trong nhóm",
      "danh sách học sinh nhóm",
      "học sinh thuộc nhóm",
    ],
    request: {
      endpoint: "/api/v1/student/by-group/{groupId}",
      method: "GET",
      pathParams: { groupId: "EXTRACT_FROM_QUERY" },
    },
    description: "Lấy danh sách học sinh theo nhóm",
  },
  {
    patterns: [
      "thông tin học sinh",
      "chi tiết học sinh",
      "học sinh có id",
      "học sinh số",
    ],
    request: {
      endpoint: "/api/v1/student/{id}",
      method: "GET",
      pathParams: { id: "EXTRACT_FROM_QUERY" },
    },
    description: "Lấy thông tin chi tiết học sinh theo ID",
  },

  // === TEACHER (Giáo viên) ===
  {
    patterns: [
      "bao nhiêu giáo viên",
      "số lượng giáo viên",
      "tổng số giáo viên",
    ],
    request: {
      endpoint: "/api/v1/teacher",
      method: "GET",
    },
    description: "Đếm số lượng giáo viên",
    type: "count",
  },
  {
    patterns: [
      "liệt kê giáo viên",
      "danh sách giáo viên",
      "tất cả giáo viên",
      "giáo viên nào",
      "thống kê giáo viên",
    ],
    request: {
      endpoint: "/api/v1/teacher",
      method: "GET",
    },
    description: "Lấy danh sách tất cả giáo viên",
    type: "list",
  },
  {
    patterns: [
      "thông tin giáo viên",
      "chi tiết giáo viên",
      "giáo viên có id",
      "giáo viên số",
    ],
    request: {
      endpoint: "/api/v1/teacher/{id}",
      method: "GET",
      pathParams: { id: "EXTRACT_FROM_QUERY" },
    },
    description: "Lấy thông tin chi tiết giáo viên theo ID",
  },

  // === GROUP (Nhóm học) ===
  {
    patterns: ["bao nhiêu nhóm học", "số lượng nhóm học", "tổng số nhóm học"],
    request: {
      endpoint: "/api/v1/group",
      method: "GET",
    },
    description: "Đếm số lượng nhóm học",
    type: "count",
  },
  {
    patterns: [
      "liệt kê nhóm học",
      "danh sách nhóm học",
      "tất cả nhóm học",
      "nhóm học nào",
      "thống kê nhóm học",
    ],
    request: {
      endpoint: "/api/v1/group",
      method: "GET",
    },
    description: "Lấy danh sách tất cả nhóm học",
    type: "list",
  },
  {
    patterns: [
      "nhóm học khối",
      "nhóm học theo khối",
      "nhóm học thuộc khối",
      "danh sách nhóm học khối",
    ],
    request: {
      endpoint: "/api/v1/group/grade/{gradeId}",
      method: "GET",
      pathParams: { gradeId: "EXTRACT_FROM_QUERY" },
    },
    description: "Lấy danh sách nhóm học theo khối",
  },
  {
    patterns: [
      "nhóm học năm học",
      "nhóm học theo năm học",
      "nhóm học thuộc năm học",
      "danh sách nhóm học năm học",
    ],
    request: {
      endpoint: "/api/v1/group/academic-year/{academicYearId}",
      method: "GET",
      pathParams: { academicYearId: "EXTRACT_FROM_QUERY" },
    },
    description: "Lấy danh sách nhóm học theo năm học",
  },
  {
    patterns: [
      "thông tin nhóm học",
      "chi tiết nhóm học",
      "nhóm học có id",
      "nhóm học số",
    ],
    request: {
      endpoint: "/api/v1/group/{id}",
      method: "GET",
      pathParams: { id: "EXTRACT_FROM_QUERY" },
    },
    description: "Lấy thông tin chi tiết nhóm học theo ID",
  },

  // === FEE (Phí) ===
  {
    patterns: [
      "liệt kê phí",
      "danh sách phí",
      "tất cả phí",
      "phí nào",
      "bao nhiêu phí",
      "số phí",
      "thống kê phí",
    ],
    request: {
      endpoint: "/api/v1/fee",
      method: "GET",
    },
    description: "Lấy danh sách tất cả phí",
  },
  {
    patterns: ["thông tin phí", "chi tiết phí", "phí có id", "phí số"],
    request: {
      endpoint: "/api/v1/fee/{id}",
      method: "GET",
      pathParams: { id: "EXTRACT_FROM_QUERY" },
    },
    description: "Lấy thông tin chi tiết phí theo ID",
  },

  // === ATTENDANCE (Điểm danh) ===
  {
    patterns: [
      "liệt kê điểm danh",
      "danh sách điểm danh",
      "tất cả điểm danh",
      "điểm danh nào",
      "bao nhiêu điểm danh",
      "số điểm danh",
      "thống kê điểm danh",
    ],
    request: {
      endpoint: "/api/v1/attendance",
      method: "GET",
    },
    description: "Lấy danh sách tất cả điểm danh",
  },
  {
    patterns: [
      "tìm kiếm điểm danh",
      "điểm danh theo nhóm",
      "điểm danh theo lịch",
      "điểm danh nhóm",
      "điểm danh lịch",
    ],
    request: {
      endpoint: "/api/v1/attendance/search",
      method: "GET",
      queryParams: {
        groupId: "EXTRACT_FROM_QUERY",
        scheduleId: "EXTRACT_FROM_QUERY",
      },
    },
    description: "Tìm kiếm điểm danh theo nhóm và lịch",
  },

  // === SCORE (Điểm số) ===
  {
    patterns: [
      "liệt kê điểm số",
      "danh sách điểm số",
      "tất cả điểm số",
      "điểm số nào",
      "bao nhiêu điểm số",
      "số điểm số",
      "thống kê điểm số",
    ],
    request: {
      endpoint: "/api/v1/score",
      method: "GET",
    },
    description: "Lấy danh sách tất cả điểm số",
  },
  {
    patterns: [
      "điểm học sinh",
      "điểm theo học sinh",
      "điểm của học sinh",
      "điểm số học sinh",
    ],
    request: {
      endpoint: "/api/v1/score/student/{studentId}",
      method: "GET",
      pathParams: { studentId: "EXTRACT_FROM_QUERY" },
    },
    description: "Lấy điểm số theo học sinh",
  },
  {
    patterns: [
      "điểm bài thi",
      "điểm theo bài thi",
      "điểm của bài thi",
      "điểm số bài thi",
    ],
    request: {
      endpoint: "/api/v1/score/exam/{examId}",
      method: "GET",
      pathParams: { examId: "EXTRACT_FROM_QUERY" },
    },
    description: "Lấy điểm số theo bài thi",
  },

  // === PAYMENT (Thanh toán) ===
  {
    patterns: [
      "liệt kê thanh toán",
      "danh sách thanh toán",
      "tất cả thanh toán",
      "thanh toán nào",
      "bao nhiêu thanh toán",
      "số thanh toán",
      "thống kê thanh toán",
    ],
    request: {
      endpoint: "/api/v1/payment-detail",
      method: "GET",
    },
    description: "Lấy danh sách tất cả thanh toán",
  },
  {
    patterns: [
      "thanh toán học sinh",
      "thanh toán theo học sinh",
      "thanh toán của học sinh",
      "chi tiết thanh toán học sinh",
    ],
    request: {
      endpoint: "/api/v1/payment-detail/student/{studentId}",
      method: "GET",
      pathParams: { studentId: "EXTRACT_FROM_QUERY" },
    },
    description: "Lấy thanh toán theo học sinh",
  },
  {
    patterns: [
      "thanh toán phí",
      "thanh toán theo phí",
      "thanh toán của phí",
      "chi tiết thanh toán phí",
    ],
    request: {
      endpoint: "/api/v1/payment-detail/fee/{feeId}",
      method: "GET",
      pathParams: { feeId: "EXTRACT_FROM_QUERY" },
    },
    description: "Lấy thanh toán theo phí",
  },

  // === SCHEDULE (Lịch học) ===
  {
    patterns: [
      "liệt kê lịch học",
      "danh sách lịch học",
      "tất cả lịch học",
      "lịch học nào",
      "bao nhiêu lịch học",
      "số lịch học",
      "thống kê lịch học",
    ],
    request: {
      endpoint: "/api/v1/schedule",
      method: "GET",
    },
    description: "Lấy danh sách tất cả lịch học",
  },
  {
    patterns: [
      "tìm kiếm lịch học",
      "lịch học theo nhóm",
      "lịch học theo ngày",
      "lịch học nhóm",
      "lịch học ngày",
    ],
    request: {
      endpoint: "/api/v1/schedule/search",
      method: "GET",
      queryParams: {
        groupId: "EXTRACT_FROM_QUERY",
        startDate: "EXTRACT_FROM_QUERY",
        endDate: "EXTRACT_FROM_QUERY",
      },
    },
    description: "Tìm kiếm lịch học theo nhóm và ngày",
  },

  // === ACADEMIC YEAR (Năm học) ===
  {
    patterns: [
      "liệt kê năm học",
      "danh sách năm học",
      "tất cả năm học",
      "năm học nào",
      "bao nhiêu năm học",
      "số năm học",
      "thống kê năm học",
    ],
    request: {
      endpoint: "/api/v1/academic-year",
      method: "GET",
    },
    description: "Lấy danh sách tất cả năm học",
  },

  // === GRADE (Khối) ===
  {
    patterns: [
      "liệt kê khối",
      "danh sách khối",
      "tất cả khối",
      "khối nào",
      "bao nhiêu khối",
      "số khối",
      "thống kê khối",
    ],
    request: {
      endpoint: "/api/v1/grade",
      method: "GET",
    },
    description: "Lấy danh sách tất cả khối",
  },

  // === SCHOOL (Trường học) ===
  {
    patterns: [
      "liệt kê trường học",
      "danh sách trường học",
      "tất cả trường học",
      "trường học nào",
      "bao nhiêu trường học",
      "số trường học",
      "thống kê trường học",
    ],
    request: {
      endpoint: "/api/v1/school",
      method: "GET",
    },
    description: "Lấy danh sách tất cả trường học",
  },

  // === SCHOOL CLASS (Lớp học) ===
  {
    patterns: [
      "liệt kê lớp học",
      "danh sách lớp học",
      "tất cả lớp học",
      "lớp học nào",
      "bao nhiêu lớp học",
      "số lớp học",
      "thống kê lớp học",
    ],
    request: {
      endpoint: "/api/v1/school-class",
      method: "GET",
    },
    description: "Lấy danh sách tất cả lớp học",
  },
  {
    patterns: [
      "lớp học khối",
      "lớp học theo khối",
      "lớp học thuộc khối",
      "danh sách lớp học khối",
    ],
    request: {
      endpoint: "/api/v1/school-class/grade/{grade}",
      method: "GET",
      pathParams: { grade: "EXTRACT_FROM_QUERY" },
    },
    description: "Lấy danh sách lớp học theo khối",
  },

  // === ROOM (Phòng học) ===
  {
    patterns: [
      "liệt kê phòng học",
      "danh sách phòng học",
      "tất cả phòng học",
      "phòng học nào",
      "bao nhiêu phòng học",
      "số phòng học",
      "thống kê phòng học",
    ],
    request: {
      endpoint: "/api/v1/room",
      method: "GET",
    },
    description: "Lấy danh sách tất cả phòng học",
  },

  // === EXAM (Bài thi) ===
  {
    patterns: [
      "liệt kê bài thi",
      "danh sách bài thi",
      "tất cả bài thi",
      "bài thi nào",
      "bao nhiêu bài thi",
      "số bài thi",
      "thống kê bài thi",
    ],
    request: {
      endpoint: "/api/v1/exam",
      method: "GET",
    },
    description: "Lấy danh sách tất cả bài thi",
  },
];

// Hàm tìm intent phù hợp nhất cho câu hỏi
export function findMatchingIntent(userQuery: string): IntentMapping | null {
  const normalizedQuery = userQuery.toLowerCase().trim();

  // Tìm intent có pattern khớp nhất
  for (const intent of INTENT_MAPPINGS) {
    for (const pattern of intent.patterns) {
      if (normalizedQuery.includes(pattern.toLowerCase())) {
        return intent;
      }
    }
  }

  return null;
}

// Hàm trích xuất tham số từ câu hỏi
export function extractParameters(
  userQuery: string,
  intent: IntentMapping
): Record<string, any> {
  const params: Record<string, any> = {};
  const normalizedQuery = userQuery.toLowerCase();

  // Trích xuất ID từ câu hỏi
  const idMatch = normalizedQuery.match(/(?:id|số|mã)\s*(\d+)/i);
  if (idMatch) {
    params.id = parseInt(idMatch[1]);
  }

  // Trích xuất groupId
  const groupMatch = normalizedQuery.match(/(?:nhóm|group)\s*(\d+)/i);
  if (groupMatch) {
    params.groupId = parseInt(groupMatch[1]);
  }

  // Trích xuất studentId
  const studentMatch = normalizedQuery.match(/(?:học sinh|student)\s*(\d+)/i);
  if (studentMatch) {
    params.studentId = parseInt(studentMatch[1]);
  }

  // Trích xuất feeId
  const feeMatch = normalizedQuery.match(/(?:phí|fee)\s*(\d+)/i);
  if (feeMatch) {
    params.feeId = parseInt(feeMatch[1]);
  }

  // Trích xuất examId
  const examMatch = normalizedQuery.match(/(?:bài thi|exam)\s*(\d+)/i);
  if (examMatch) {
    params.examId = parseInt(examMatch[1]);
  }

  // Trích xuất gradeId
  const gradeMatch = normalizedQuery.match(/(?:khối|grade)\s*(\d+)/i);
  if (gradeMatch) {
    params.gradeId = parseInt(gradeMatch[1]);
  }

  // Trích xuất academicYearId
  const yearMatch = normalizedQuery.match(/(?:năm học|academic year)\s*(\d+)/i);
  if (yearMatch) {
    params.academicYearId = parseInt(yearMatch[1]);
  }

  return params;
}

// Hàm tạo API request hoàn chỉnh
export function createApiRequest(userQuery: string): ApiRequest | null {
  const intent = findMatchingIntent(userQuery);
  if (!intent) {
    return null;
  }

  const params = extractParameters(userQuery, intent);
  const request = { ...intent.request };

  // Thay thế path params
  if (request.pathParams) {
    for (const [key, value] of Object.entries(request.pathParams)) {
      if (value === "EXTRACT_FROM_QUERY" && params[key]) {
        request.pathParams[key] = params[key];
      }
    }
  }

  // Thay thế query params
  if (request.queryParams) {
    for (const [key, value] of Object.entries(request.queryParams)) {
      if (value === "EXTRACT_FROM_QUERY" && params[key]) {
        request.queryParams[key] = params[key];
      }
    }
  }

  return request;
}
