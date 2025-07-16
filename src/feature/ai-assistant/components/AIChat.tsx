import {
  AIConversation,
  AIConversationContent,
} from "@/components/ui/kibo-ui/ai/conversation";
import { AIInput, AIInputTextarea } from "@/components/ui/kibo-ui/ai/input";
import {
  AIMessage,
  AIMessageContent,
} from "@/components/ui/kibo-ui/ai/message";
import {
  AIReasoning,
  AIReasoningContent,
  AIReasoningTrigger,
} from "@/components/ui/kibo-ui/ai/reasoning";
import { Loader2 } from "lucide-react";
import React, { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  GeminiChatHistoryItem,
  streamGeminiChat,
} from "../services/gemini-chat.service";

export interface AIChatProps {
  systemPrompt: string;
  initialHistory?: GeminiChatHistoryItem[];
  height?: string; // e.g. '400px' or '60vh'
}

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
  reasoning?: string;
  isReasoningStreaming?: boolean;
}

const AIChat: React.FC<AIChatProps> = ({
  systemPrompt,
  initialHistory = [],
  height = "400px",
}) => {
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>(initialHistory);
  const [isLoading, setIsLoading] = useState(false);
  const answerRef = useRef("");
  const reasoningRef = useRef("");

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const userMessage: ChatMessage = {
      role: "user",
      parts: [{ text: prompt }],
    };
    const updatedHistory = [...history, userMessage];
    setHistory(updatedHistory);
    setPrompt("");
    setIsLoading(true);
    answerRef.current = "";
    reasoningRef.current = "";

    streamGeminiChat({
      prompt,
      history: updatedHistory as GeminiChatHistoryItem[],
      systemPrompt,
      onAnswer: (answer) => {
        answerRef.current = answer;
        setHistory((prev) => {
          if (prev.length > 0 && prev[prev.length - 1].role === "model") {
            return [
              ...prev.slice(0, -1),
              {
                ...prev[prev.length - 1],
                parts: [{ text: answer }],
                reasoning: reasoningRef.current,
                isReasoningStreaming: true,
              },
            ];
          } else {
            return [
              ...prev,
              {
                role: "model",
                parts: [{ text: answer }],
                reasoning: reasoningRef.current,
                isReasoningStreaming: true,
              },
            ];
          }
        });
      },
      onReasoning: (reasoning) => {
        reasoningRef.current = reasoning;
        setHistory((prev) => {
          if (prev.length > 0 && prev[prev.length - 1].role === "model") {
            return [
              ...prev.slice(0, -1),
              {
                ...prev[prev.length - 1],
                parts: [{ text: answerRef.current }],
                reasoning,
                isReasoningStreaming: true,
              },
            ];
          } else {
            return [
              ...prev,
              {
                role: "model",
                parts: [{ text: answerRef.current }],
                reasoning,
                isReasoningStreaming: true,
              },
            ];
          }
        });
      },
      onDone: () => {
        setHistory((prev) => {
          if (prev.length > 0 && prev[prev.length - 1].role === "model") {
            return [
              ...prev.slice(0, -1),
              {
                ...prev[prev.length - 1],
                isReasoningStreaming: false,
              },
            ];
          }
          return prev;
        });
        setIsLoading(false);
      },
      onError: (err) => {
        setHistory((prev) => [
          ...prev,
          { role: "model", parts: [{ text: "Sorry, there was an error." }] },
        ]);
        setIsLoading(false);
      },
    });
  };

  return (
    <AIConversation
      className="border-2 border-gray-200 relative"
      style={{ maxHeight: height, height }}
    >
      <AIConversationContent style={{ maxHeight: height, overflowY: "auto" }}>
        {history.map((item, index) => (
          <AIMessage
            key={index}
            from={item.role === "user" ? "user" : "assistant"}
          >
            <AIMessageContent>
              {item.role === "model" ? (
                <>
                  <ReactMarkdown>
                    {item.parts.map((p) => p.text).join("")}
                  </ReactMarkdown>
                  {item.reasoning && (
                    <AIReasoning
                      isStreaming={item.isReasoningStreaming}
                      className="mt-2"
                    >
                      <AIReasoningTrigger title="Luồng suy nghĩ" />
                      <AIReasoningContent>{item.reasoning}</AIReasoningContent>
                    </AIReasoning>
                  )}
                </>
              ) : (
                item.parts.map((p) => p.text).join("")
              )}
            </AIMessageContent>
          </AIMessage>
        ))}
        {isLoading && (
          <AIMessage from="assistant">
            <AIMessageContent>
              Đang trả lời...
              <span className="ml-2">
                <Loader2 className="animate-spin" />
              </span>
            </AIMessageContent>
          </AIMessage>
        )}
      </AIConversationContent>
      <AIInput
        onSubmit={handleSendMessage}
        className="rounded-sm sticky bottom-0"
      >
        <AIInputTextarea
          placeholder="Nhập tin nhắn..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
        />
      </AIInput>
    </AIConversation>
  );
};

export default AIChat;
