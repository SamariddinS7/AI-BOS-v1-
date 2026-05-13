import { callGeminiWithRetry } from './src/lib/gemini.ts';

async function executeSkillWithAI(skillType: string, parameters: any) {
  const prompt = `Siz maxsus AI Marketing kouchisiz (O'zbek tilida gapiradigan).
Vazifa: ${skillType}
Parametrlar: ${JSON.stringify(parameters)}

Iltimos, marketing strategiyasini O'zbek tilida ishlab chiqing va faqatgina quyidagi JSON formatida qaytaring:
{
  "ai_fikri": "AI nomidan izoh",
  "kutilayotgan_natija": "qisqa xulosa",
  "bashorat": "strategik bashorat tafsiloti"
}
Diqqat! Ingliz tilidagi eski shablonlarni unuting. Barcha so'zlar haqiqiy tahlilga asoslangan o'zbek tilida bo'lishi shart!`;
  try {
    const aiResponse = await callGeminiWithRetry('gemini-2.5-flash', {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.9
      }
    });
    
    console.log("RAW", aiResponse.text);
  } catch(e) {
    console.error(e);
  }
}
executeSkillWithAI('copywriting', { target: 'test' });
