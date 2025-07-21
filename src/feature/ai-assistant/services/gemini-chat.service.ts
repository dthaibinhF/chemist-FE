import { GoogleGenAI } from "@google/genai";
import { callRestApi } from "./rest-api-client";
import { createApiRequest, findMatchingIntent } from "./rest-api-mapping";
import { Plan, executePlan, tools } from "./tool-engine";

export interface GeminiChatHistoryItem {
  role: "user" | "model";
  parts: { text: string }[];
}

// Hàm reasoning nhiều bước với tool use engine
async function reasoningWithTools({
  prompt,
  history,
  systemPrompt,
  onAnswer,
  onReasoning,
  onDone,
  onError,
}: {
  prompt: string;
  history: GeminiChatHistoryItem[];
  systemPrompt: string;
  onAnswer: (text: string) => void;
  onReasoning: (reasoning: string) => void;
  onDone: () => void;
  onError: (err: any) => void;
}) {
  const ai = new GoogleGenAI({
    apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY,
  });
  try {
    // 1. Gửi prompt cho Gemini để sinh plan (dạng JSON)
    const toolList = tools
      .map(
        (t) =>
          `- ${t.name}: ${t.description}. params: ${JSON.stringify(t.params)}`
      )
      .join("\n");
    const planPrompt = `Bạn là trợ lý AI có thể sử dụng các tool (API) sau để trả lời câu hỏi của người dùng.\n\nCác tool có sẵn:\n${toolList}\n\nNếu câu hỏi yêu cầu đếm số học sinh trong một nhóm theo tên, hãy:\n1. Gọi getGroups để lấy ID nhóm theo tên.\n2. Gọi getStudentsByGroupId với groupId vừa tìm được.\n3. Đếm số lượng học sinh.\n\nHãy lập kế hoạch các bước reasoning (plan) để trả lời câu hỏi sau. Mỗi bước là một object JSON gồm: tool, params, saveAs. Trả về một mảng JSON các bước reasoning.\n\nCâu hỏi: \"${prompt}\"`;
    const planChat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: { includeThoughts: true },
      },
    });
    let planJson = "";
    let reasoning = "";
    const planStream = await planChat.sendMessageStream({
      message: planPrompt,
    });
    for await (const chunk of planStream) {
      const parts = chunk.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if (part.thought) {
          reasoning += part.text ?? "";
          onReasoning(reasoning);
        } else {
          planJson += part.text ?? "";
        }
      }
    }
    // 2. Parse plan
    let plan: Plan;
    try {
      plan = JSON.parse(planJson.match(/\[.*\]/s)?.[0] ?? planJson);
    } catch (e) {
      onAnswer(
        "Không thể phân tích kế hoạch reasoning từ AI. Vui lòng hỏi lại hoặc thử câu hỏi khác."
      );
      onDone();
      return;
    }
    // 3. Thực thi plan
    onReasoning(
      "Đang thực thi các bước reasoning và truy xuất dữ liệu thực tế từ hệ thống..."
    );
    let planResult: Record<string, any>;
    try {
      planResult = await executePlan(plan);
    } catch (err: any) {
      onAnswer(`Đã xảy ra lỗi khi thực thi kế hoạch reasoning: ${err.message}`);
      onDone();
      return;
    }
    // 4. Tổng hợp kết quả, truyền cho Gemini để trả lời tự nhiên
    const resultPrompt = `Dưới đây là kết quả các bước reasoning để trả lời câu hỏi của người dùng.\n\nCâu hỏi: \"${prompt}\"\n\nKết quả reasoning:\n\u0060\u0060\u0060json\n${JSON.stringify(planResult, null, 2)}\n\u0060\u0060\u0060\n\nHãy trả lời ngắn gọn, tự nhiên, thân thiện, đúng ngữ cảnh.`;
    const resultChat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: { includeThoughts: true },
      },
    });
    let answer = "";
    let reasoning2 = "";
    const resultStream = await resultChat.sendMessageStream({
      message: resultPrompt,
    });
    for await (const chunk of resultStream) {
      const parts = chunk.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if (part.thought) {
          reasoning2 += part.text ?? "";
          onReasoning(reasoning2);
        } else {
          answer += part.text ?? "";
          onAnswer(answer);
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err);
  }
}

export function streamGeminiChat({
  prompt,
  history,
  systemPrompt,
  onAnswer,
  onReasoning,
  onDone,
  onError,
}: {
  prompt: string;
  history: GeminiChatHistoryItem[];
  systemPrompt: string;
  onAnswer: (text: string) => void;
  onReasoning: (reasoning: string) => void;
  onDone: () => void;
  onError: (err: any) => void;
}) {
  const ai = new GoogleGenAI({
    apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY,
  });
  (async () => {
    try {
      // Nhận diện intent và mapping sang RESTful API
      const apiRequest = createApiRequest(prompt);
      const intent = apiRequest ? findMatchingIntent(prompt) : null;
      if (apiRequest) {
        try {
          onReasoning(
            "Đang phân tích câu hỏi và truy xuất dữ liệu thực tế từ hệ thống (RESTful API)..."
          );
          const apiResult = await callRestApi(apiRequest);
          // Nếu intent là 'count' và kết quả là mảng, tạo prompt cho Gemini để trả lời tự nhiên
          if (intent?.type === "count" && Array.isArray(apiResult)) {
            const countPrompt = `Dựa trên dữ liệu sau, hãy trả lời câu hỏi của người dùng một cách tự nhiên, thân thiện, phù hợp ngữ cảnh.\nChỉ trả lời số lượng nếu người dùng hỏi về số lượng, có thể thêm nhận xét ngắn gọn nếu phù hợp.\n\nCâu hỏi gốc: "${prompt}"\n\nSố lượng: ${apiResult.length}`;
            const dataChat = ai.chats.create({
              model: "gemini-2.5-flash",
              history: history,
              config: {
                systemInstruction: systemPrompt,
                thinkingConfig: { includeThoughts: true },
              },
            });
            let answer = "";
            let reasoning = "";
            const stream = await dataChat.sendMessageStream({
              message: countPrompt,
            });
            for await (const chunk of stream) {
              const parts = chunk.candidates?.[0]?.content?.parts ?? [];
              for (const part of parts) {
                if (part.thought) {
                  reasoning += part.text ?? "";
                  onReasoning(reasoning);
                } else {
                  answer += part.text ?? "";
                  onAnswer(answer);
                }
              }
            }
            onDone();
            return;
          }
          // Nếu kết quả là một chuỗi (không phải object/array), có thể là thông báo lỗi hoặc text đơn giản
          if (typeof apiResult === "string") {
            onAnswer(apiResult);
            onDone();
            return;
          }
          // Diễn giải dữ liệu trả về bằng Gemini
          const dataPrompt = `Dựa trên dữ liệu JSON sau đây, hãy trả lời câu hỏi gốc của người dùng một cách tự nhiên, thân thiện và dễ hiểu bằng tiếng Việt.\nTrình bày kết quả dưới dạng bảng markdown nếu có nhiều hơn một hàng dữ liệu.\nKhông đề cập đến việc bạn nhận được dữ liệu JSON. Chỉ cần trả lời câu hỏi.\n\nCâu hỏi gốc: "${prompt}"\n\nDữ liệu:\n\u0060\u0060\u0060json\n${JSON.stringify(apiResult, null, 2)}\n\u0060\u0060\u0060\n`;
          const dataChat = ai.chats.create({
            model: "gemini-2.5-flash",
            history: history,
            config: {
              systemInstruction: systemPrompt,
              thinkingConfig: { includeThoughts: true },
            },
          });
          let answer = "";
          let reasoning = "";
          const stream = await dataChat.sendMessageStream({
            message: dataPrompt,
          });
          for await (const chunk of stream) {
            const parts = chunk.candidates?.[0]?.content?.parts ?? [];
            for (const part of parts) {
              if (part.thought) {
                reasoning += part.text ?? "";
                onReasoning(reasoning);
              } else {
                answer += part.text ?? "";
                onAnswer(answer);
              }
            }
          }
          onDone();
          return;
        } catch (err: any) {
          onAnswer(
            `Đã xảy ra lỗi khi truy vấn RESTful API: ${err.message}. Vui lòng kiểm tra lại server và thử lại.`
          );
          onDone();
          return;
        }
      }
      // Nếu không nhận diện được intent, thử reasoning nhiều bước với tool use engine
      await reasoningWithTools({
        prompt,
        history,
        systemPrompt,
        onAnswer,
        onReasoning,
        onDone,
        onError,
      });
    } catch (err) {
      onError(err);
    }
  })();
}
