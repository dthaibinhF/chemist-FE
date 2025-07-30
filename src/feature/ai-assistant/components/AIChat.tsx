"use client";

import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@/components/ui/kibo-ui/ai/conversation";
import {
  AIInput,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
} from "@/components/ui/kibo-ui/ai/input";
import {
  AIMessage,
  AIMessageContent,
} from "@/components/ui/kibo-ui/ai/message";
import { AIResponse } from "@/components/ui/kibo-ui/ai/response";
import { LoadingDots } from "@/components/common";
import { cn } from "@/lib/utils";
import { aiService, type ChatMessage } from "@/service/ai.service";
import type { TAccount } from "@/feature/auth/types/auth.type";
import { BotIcon } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface AIChatProps {
  height?: string;
  className?: string;
  conversationId?: string;
  welcomeMessage?: string;
  userAccount?: TAccount | null;
}

type StreamingStatus = "ready" | "submitted" | "streaming" | "error";

export const AIChat: React.FC<AIChatProps> = ({
  height = "60vh",
  className,
  conversationId,
  welcomeMessage = "Xin chào! Tôi là Junie, trợ lý AI của Chemist. Tôi có thể giúp bạn tìm hiểu về học sinh, lịch học, điểm số và nhiều thông tin khác. Hãy hỏi tôi bất cứ điều gì bạn muốn biết!",
  userAccount,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [status, setStatus] = useState<StreamingStatus>("ready");
  const [currentConversationId] = useState(
    conversationId || aiService.generateConversationId()
  );
  const eventSourceRef = useRef<EventSource | null>(null);
  const currentStreamingMessageRef = useRef<ChatMessage | null>(null);

  // Thêm welcome message khi component mount
  useEffect(() => {
    if (welcomeMessage) {
      const welcomeMsg: ChatMessage = {
        id: "welcome_msg",
        content: welcomeMessage,
        from: "assistant",
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }
  }, [welcomeMessage]);

  // Cleanup EventSource khi component unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Xử lý gửi tin nhắn
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!inputMessage.trim() || status === "streaming" || status === "submitted") {
        return;
      }

      const userMessage = aiService.formatUserMessage(inputMessage.trim());

      // Thêm tin nhắn của user vào conversation
      setMessages((prev) => [...prev, userMessage]);
      setInputMessage("");
      setStatus("submitted");

      try {
        // Tạo tin nhắn streaming placeholder
        const streamingMessageId = `streaming_${Date.now()}`;
        const streamingMessage: ChatMessage = {
          id: streamingMessageId,
          content: "",
          from: "assistant",
          timestamp: new Date(),
          isStreaming: true,
        };

        setMessages((prev) => [...prev, streamingMessage]);
        currentStreamingMessageRef.current = streamingMessage;
        setStatus("streaming");

        // Cleanup previous EventSource if exists
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        // Bắt đầu streaming
        eventSourceRef.current = aiService.streamChat(
          inputMessage.trim(),
          currentConversationId,
          userAccount,
          // onChunk
          (chunk: string) => {
            // Cập nhật tin nhắn streaming trong danh sách
            setMessages((prevMessages) => {
              return prevMessages.map((msg) => {
                if (msg.id === streamingMessageId) {
                  return {
                    ...msg,
                    content: msg.content + chunk,
                  };
                }
                return msg;
              });
            });
          },
          // onComplete
          () => {
            setStatus("ready");

            // Cập nhật tin nhắn cuối cùng để loại bỏ trạng thái streaming
            setMessages((prevMessages) => {
              return prevMessages.map((msg) => {
                if (msg.id === streamingMessageId) {
                  return {
                    ...msg,
                    isStreaming: false,
                  };
                }
                return msg;
              });
            });

            currentStreamingMessageRef.current = null;
            eventSourceRef.current = null;
          },
          // onError
          (error) => {
            console.error("Streaming error:", error);
            setStatus("error");

            // Xóa tin nhắn streaming placeholder và hiển thị lỗi
            setMessages((prevMessages) => {
              const filtered = prevMessages.filter((msg) => msg.id !== streamingMessageId);
              return [
                ...filtered,
                {
                  id: `error_${Date.now()}`,
                  content: "Xin lỗi, có lỗi xảy ra khi xử lý tin nhắn của bạn. Vui lòng thử lại.",
                  from: "assistant" as const,
                  timestamp: new Date(),
                },
              ];
            });

            currentStreamingMessageRef.current = null;
            eventSourceRef.current = null;
            toast.error("Có lỗi xảy ra khi gửi tin nhắn");
          }
        );
      } catch (error) {
        console.error("Error sending message:", error);
        setStatus("error");
        toast.error("Không thể gửi tin nhắn. Vui lòng thử lại.");

        // Xóa tin nhắn streaming placeholder
        setMessages((prev) => prev.filter((msg) => !msg.isStreaming));
      }
    },
    [inputMessage, status, currentConversationId, userAccount]
  );

  // Xử lý dừng streaming
  const handleStop = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStatus("ready");

    // Cập nhật tin nhắn streaming cuối cùng
    if (currentStreamingMessageRef.current) {
      setMessages((prevMessages) => {
        return prevMessages.map((msg) => {
          if (msg.id === currentStreamingMessageRef.current?.id) {
            return {
              ...msg,
              isStreaming: false,
            };
          }
          return msg;
        });
      });
      currentStreamingMessageRef.current = null;
    }
  }, []);

  // Xử lý thay đổi input
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputMessage(e.target.value);
    },
    []
  );

  // Render tin nhắn
  const renderMessage = useCallback((message: ChatMessage) => {
    const isUser = message.from === "user";

    return (
      <AIMessage key={message.id} from={message.from}>
        <AIMessageContent>
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <AIResponse options={{ children: message.content }}>
              {message.content}
            </AIResponse>
          )}
          {message.tools_used && message.tools_used.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              Đã sử dụng: {message.tools_used.join(", ")}
            </div>
          )}
          {message.isStreaming && (
            <div className="mt-2 flex items-center gap-1">
              <LoadingDots size="sm" color="primary" />
            </div>
          )}
        </AIMessageContent>
      </AIMessage>
    );
  }, []);

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-lg border bg-background",
        className
      )}
      style={{ height }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <BotIcon className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Junie - Trợ lý AI</h2>
        </div>
        <div className="text-xs text-muted-foreground">
          {status === "streaming" && "Đang trả lời..."}
          {status === "submitted" && "Đang xử lý..."}
          {status === "ready" && "Sẵn sàng"}
          {status === "error" && "Có lỗi"}
        </div>
      </div>

      {/* Messages Area */}
      <AIConversation className="flex-1">
        <AIConversationContent>
          {messages.map(renderMessage)}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>

      {/* Input Area */}
      <div className="border-t p-3">
        <AIInput onSubmit={handleSubmit}>
          <AIInputTextarea
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Hỏi Junie về học sinh, lịch học, điểm số..."
            disabled={status === "streaming" || status === "submitted"}
            minHeight={40}
            maxHeight={100}
          />
          <AIInputToolbar>
            <div className="flex-1" />
            <AIInputSubmit
              status={status}
              disabled={!inputMessage.trim() || status === "submitted"}
              onClick={status === "streaming" ? handleStop : undefined}
            />
          </AIInputToolbar>
        </AIInput>
      </div>
    </div>
  );
};

export default AIChat;