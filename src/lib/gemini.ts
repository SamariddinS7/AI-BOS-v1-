import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

/**
 * Calls the Gemini API with exponential backoff retry logic for 429 errors.
 * @param modelName The model to use (e.g., "gemini-3-flash-preview")
 * @param params The generation parameters
 * @param retries Number of retries (default: 3)
 * @param delay Initial delay in ms (default: 1000)
 */
export async function callGeminiWithRetry(
  modelName: string,
  params: any,
  retries = 3,
  delay = 2000
): Promise<any> {
  try {
    const response = await getAi().models.generateContent({
      model: modelName,
      ...params
    });

    // Validate JSON if responseMimeType is application/json
    if (params.config?.responseMimeType === 'application/json') {
      try {
        JSON.parse(response.text || '{}');
      } catch (e) {
        throw new Error("AI noto'g'ri formatda javob qaytardi (Malformed JSON).");
      }
    }

    return response;
  } catch (error: any) {
    const isQuotaError = error.message?.includes('429') || 
                         error.message?.includes('Quota exceeded') || 
                         error.status === 429;

    if (isQuotaError && retries > 0) {
      console.warn(`Quota exceeded. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callGeminiWithRetry(modelName, params, retries - 1, delay * 2);
    }

    if (isQuotaError) {
      throw new Error("AI xizmati hozirda juda band (Quota exceeded). Iltimos, 1 daqiqadan so'ng qayta urinib ko'ring.");
    }

    throw error;
  }
}
