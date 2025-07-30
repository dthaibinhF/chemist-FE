import { getAccessToken } from "@/feature/auth/services/token-manager";
import type { TAccount } from "@/feature/auth/types/auth.type";

const API_URL = import.meta.env.VITE_SERVER_ROOT_URL;

/**
 * Interface cho phản hồi từ AI API
 */
export interface AIResponse {
  response: string;
  conversation_id?: string | null;
  timestamp: string;
  tools_used?: string[] | null;
  error?: string | null;
  success: boolean;
}

/**
 * Interface cho yêu cầu chat đơn giản
 */
export interface SimpleChatRequest {
  message: string;
  user_context?: {
    user_id?: number;
    user_role?: string;
    user_name?: string;
  };
}

/**
 * Interface cho yêu cầu chat có ngữ cảnh
 */
export interface ConversationalChatRequest {
  message: string;
  conversation_id: string;
  system_message?: string;
  user_context?: {
    user_id?: number;
    user_role?: string;
    user_name?: string;
  };
}

/**
 * Interface cho thông tin tin nhắn trong cuộc trò chuyện
 */
export interface ChatMessage {
  id: string;
  content: string;
  from: "user" | "assistant";
  timestamp: Date;
  tools_used?: string[];
  isStreaming?: boolean;
}

/**
 * Service để tương tác với AI Assistant API
 * Hỗ trợ cả người dùng đã đăng nhập và chưa đăng nhập (PUBLIC)
 */
export class AIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_URL}/ai`;
  }

  /**
   * Tạo headers cho request, tự động thêm JWT token nếu có
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Thêm JWT token nếu người dùng đã đăng nhập
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Kiểm tra tình trạng hoạt động của AI service
   */
  async healthCheck(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      console.error("AI Health Check Error:", error);
      throw new Error("Không thể kết nối với AI Assistant");
    }
  }

  /**
   * Gửi tin nhắn chat đơn giản (stateless)
   * Hỗ trợ cả người dùng PUBLIC và đã đăng nhập
   */
  async simpleChat(message: string, userAccount?: TAccount | null): Promise<AIResponse> {
    try {
      const request: SimpleChatRequest = {
        message,
        user_context: userAccount ? {
          user_id: userAccount.id,
          user_role: userAccount.role_name,
          user_name: userAccount.name,
        } : undefined,
      };

      const response = await fetch(`${this.baseUrl}/chat/simple`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else if (response.status === 403) {
          throw new Error("Bạn không có quyền truy cập tính năng này.");
        } else {
          throw new Error(`AI Chat failed: ${response.status}`);
        }
      }

      const data: AIResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "AI request failed");
      }

      return data;
    } catch (error) {
      console.error("AI Simple Chat Error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi gửi tin nhắn"
      );
    }
  }

  /**
   * Gửi tin nhắn chat có ngữ cảnh (stateful)
   * Lưu trữ lịch sử cuộc trò chuyện
   */
  async conversationalChat(
    message: string,
    conversationId: string,
    userAccount?: TAccount | null,
    systemMessage?: string
  ): Promise<AIResponse> {
    try {
      const request: ConversationalChatRequest = {
        message,
        conversation_id: conversationId,
        system_message: systemMessage,
        user_context: userAccount ? {
          user_id: userAccount.id,
          user_role: userAccount.role_name,
          user_name: userAccount.name,
        } : undefined,
      };

      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else if (response.status === 403) {
          throw new Error("Bạn không có quyền truy cập tính năng này.");
        } else {
          throw new Error(`AI Conversational Chat failed: ${response.status}`);
        }
      }

      const data: AIResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "AI request failed");
      }

      return data;
    } catch (error) {
      console.error("AI Conversational Chat Error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi gửi tin nhắn"
      );
    }
  }

  /**
   * Gửi tin nhắn với streaming response
   * Trả về EventSource để nhận dữ liệu theo thời gian thực
   * Hỗ trợ cả người dùng đã đăng nhập và chưa đăng nhập
   */
  streamChat(
    message: string,
    conversationId?: string,
    userAccount?: TAccount | null,
    onChunk?: (chunk: string) => void,
    onComplete?: () => void,
    onError?: (error: Event) => void
  ): EventSource {
    // Tạo URL với query parameters
    const params = new URLSearchParams({ message });
    if (conversationId) {
      params.append("conversation_id", conversationId);
    }

    // Thêm JWT token để xác thực (EventSource không hỗ trợ custom headers)
    const token = getAccessToken();
    if (token) {
      params.append("token", token);
    }

    // Thêm thông tin user context nếu có
    if (userAccount) {
      params.append("user_id", userAccount.id.toString());
      params.append("user_role", userAccount.role_name);
      params.append("user_name", userAccount.name);
    }

    const url = `${this.baseUrl}/chat/stream?${params}`;

    // Tạo EventSource để nhận streaming data
    const eventSource = new EventSource(url);

    // Flag để theo dõi trạng thái hoàn thành bình thường
    let isCompleted = false;
    let timeoutId: NodeJS.Timeout | null = null;

    // Cleanup function
    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    // Set timeout để tránh hanging streams
    timeoutId = setTimeout(() => {
      if (!isCompleted) {
        console.warn("Stream timeout after 60 seconds");
        isCompleted = true;
        eventSource.close();
        cleanup();
        onError?.(new Event("timeout") as Event);
      }
    }, 60000); // 60 seconds timeout

    // Xử lý tin nhắn streaming thông thường
    eventSource.onmessage = (event) => {
      if (event.data === "[END]") {
        // Đánh dấu là đã hoàn thành bình thường trước khi đóng
        isCompleted = true;
        cleanup();
        eventSource.close();
        onComplete?.();
      } else if (event.data.trim() !== "") {
        // Chỉ xử lý chunks không rỗng
        onChunk?.(event.data);
      }
    };

    // Xử lý custom events (như event:end từ Claude Haiku)
    eventSource.addEventListener("end", (event) => {
      // Khi nhận được event:end, đánh dấu hoàn thành ngay lập tức
      isCompleted = true;
      cleanup();

      // Kiểm tra nếu data là [END] thì gọi onComplete
      if ((event as MessageEvent).data === "[END]") {
        eventSource.close();
        onComplete?.();
      }
    });

    // Xử lý lỗi - chỉ gọi onError khi thực sự có lỗi, không phải khi stream kết thúc bình thường
    eventSource.onerror = (event) => {
      cleanup();

      // Đóng connection nếu chưa đóng
      if (eventSource.readyState !== EventSource.CLOSED) {
        eventSource.close();
      }

      // Chỉ gọi callback lỗi nếu stream chưa hoàn thành bình thường
      // EventSource luôn fire onerror khi connection đóng, kể cả khi hoàn thành bình thường
      if (!isCompleted) {
        console.error("EventSource error:", event);
        
        // Kiểm tra lỗi xác thực và đưa ra thông báo phù hợp
        if (eventSource.readyState === EventSource.CLOSED) {
          const error = event as any;
          if (error.target?.url?.includes("stream") && !getAccessToken()) {
            console.warn("Streaming failed due to missing authentication token");
          } else if (error.target?.status === 401 || error.target?.status === 403) {
            console.warn("Streaming failed due to authentication/authorization error");
          }
        }
        
        onError?.(event);
      }
    };

    return eventSource;
  }

  /**
   * Tạo conversation ID mới
   */
  generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Format message từ AI response thành ChatMessage
   */
  formatAIMessage(response: AIResponse, messageId?: string): ChatMessage {
    return {
      id: messageId || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      content: response.response,
      from: "assistant",
      timestamp: new Date(response.timestamp),
      tools_used: response.tools_used || undefined,
    };
  }

  /**
   * Format tin nhắn user thành ChatMessage
   */
  formatUserMessage(content: string, messageId?: string): ChatMessage {
    return {
      id: messageId || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      content,
      from: "user",
      timestamp: new Date(),
    };
  }
}

// Export singleton instance
export const aiService = new AIService();