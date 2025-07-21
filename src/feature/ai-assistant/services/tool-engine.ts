// Tool Use Engine Scaffold

// Định nghĩa một tool (API endpoint)
export interface Tool {
  name: string;
  description: string;
  params: Record<string, any>;
  call: (params: Record<string, any>) => Promise<any>;
}

// Định nghĩa một bước trong kế hoạch (plan)
export interface PlanStep {
  tool: string; // tên tool
  params: Record<string, any>; // tham số truyền vào tool
  saveAs: string; // tên biến lưu kết quả
}

// Định nghĩa một kế hoạch (plan)
export type Plan = PlanStep[];

// Ví dụ: Đăng ký các tool (API endpoint)
import { callRestApi } from "./rest-api-client";

export const tools: Tool[] = [
  {
    name: "getGroups",
    description: "Lấy danh sách nhóm học (có thể filter theo tên)",
    params: { name: "string?" },
    call: async (params) => {
      return callRestApi({
        endpoint: "/api/v1/group",
        method: "GET",
        queryParams: params.name ? { name: params.name } : undefined,
      });
    },
  },
  {
    name: "getStudentsByGroupId",
    description: "Lấy danh sách học sinh theo groupId",
    params: { groupId: "string" },
    call: async (params) => {
      return callRestApi({
        endpoint: `/api/v1/student/by-group/${params.groupId}`,
        method: "GET",
      });
    },
  },
  {
    name: "getAllStudents",
    description: "Lấy toàn bộ học sinh",
    params: {},
    call: async () => {
      return callRestApi({
        endpoint: "/api/v1/student",
        method: "GET",
      });
    },
  },
  // Có thể bổ sung thêm các tool khác ở đây
];

// Hàm tìm tool theo tên
export function findTool(name: string): Tool | undefined {
  return tools.find((t) => t.name === name);
}

// Plan executor: thực thi từng bước trong plan
export async function executePlan(plan: Plan): Promise<Record<string, any>> {
  const context: Record<string, any> = {};
  for (const step of plan) {
    // Thay thế biến trong params nếu có dạng {{var}}
    const resolvedParams: Record<string, any> = {};
    for (const [k, v] of Object.entries(step.params)) {
      if (typeof v === "string" && v.startsWith("{{") && v.endsWith("}}")) {
        const varName = v.slice(2, -2).trim();
        resolvedParams[k] = context[varName];
      } else {
        resolvedParams[k] = v;
      }
    }
    const tool = findTool(step.tool);
    if (!tool) throw new Error(`Tool not found: ${step.tool}`);
    const result = await tool.call(resolvedParams);
    context[step.saveAs] = result;
  }
  return context;
}

// Ví dụ plan mẫu
export const examplePlan: Plan = [
  {
    tool: "getGroups",
    params: { name: "12NC1" },
    saveAs: "groupResult",
  },
  {
    tool: "getStudentsByGroupId",
    params: { groupId: "{{groupResult[0].id}}" },
    saveAs: "studentsResult",
  },
];
