import { getAccessToken } from "@/feature/auth/services/token-manager";

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
}

/**
 * Interface cho yêu cầu chat có ngữ cảnh
 */
export interface ConversationalChatRequest {
  message: string;
  conversation_id: string;
  system_message?: string;
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
  async simpleChat(request: SimpleChatRequest): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/simple`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`AI Chat failed: ${response.status}`);
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
  async conversationalChat(request: ConversationalChatRequest): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`AI Conversational Chat failed: ${response.status}`);
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
   */
  streamChat(
    message: string,
    conversationId?: string,
    onChunk?: (chunk: string) => void,
    onComplete?: () => void,
    onError?: (error: Event) => void
  ): EventSource {
    // Tạo URL với query parameters
    const params = new URLSearchParams({ message });
    if (conversationId) {
      params.append("conversation_id", conversationId);
    }

    const url = `${this.baseUrl}/chat/stream?${params}`;

    // Tạo EventSource để nhận streaming data
    const eventSource = new EventSource(url);

    // Xử lý tin nhắn streaming
    eventSource.onmessage = (event) => {
      if (event.data === "[END]") {
        eventSource.close();
        onComplete?.();
      } else {
        onChunk?.(event.data);
      }
    };

    // Xử lý lỗi
    eventSource.onerror = (event) => {
      eventSource.close();
      onError?.(event);
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