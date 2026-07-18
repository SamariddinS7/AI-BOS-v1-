import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  async generateStream(
    messages: { role: string; content: string }[],
    systemInstruction: string,
    onChunk: (chunk: string) => void
  ) {
    try {
      const promptString = messages.map(m => `${m.role}: ${m.content}`).join('\n');

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.1-pro-preview",
        contents: promptString,
        config: {
          systemInstruction: systemInstruction || "Siz AI-BOS yordamchisiz. Qisqa, aniq va suhbatdoshdek javob bering.",
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          onChunk(chunk.text);
        }
      }
    } catch (e: any) {
      console.error("Gemini API xatoligi:", e);
      onChunk("Xatolik yuz berdi: " + e.message);
    }
  }
};
