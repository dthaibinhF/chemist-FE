import { GoogleGenAI } from "@google/genai";

export interface GeminiChatHistoryItem {
  role: "user" | "model";
  parts: { text: string }[];
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
  onReasoning: (text: string) => void;
  onDone: () => void;
  onError: (err: any) => void;
}) {
  const ai = new GoogleGenAI({
    apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY,
  });
  (async () => {
    try {
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history,
        config: {
          systemInstruction: systemPrompt,
          thinkingConfig: {
            includeThoughts: true,
          },
        },
      });
      let answer = "";
      let reasoning = "";
      const stream = await chat.sendMessageStream({ message: prompt });
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
    } catch (err) {
      onError(err);
    }
  })();
}
