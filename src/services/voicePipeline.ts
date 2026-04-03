/**
 * SentenceQueue: Matnlarni gapma-gap navbatga qo'yib o'qiydi.
 * Bu streaming AI javoblarini "gapirayotgan" vaqtda uzilishlarsiz eshitish imkonini beradi.
 */
export class SentenceQueue {
  private queue: string[] = [];
  private isBusy = false;
  private isStopped = false;

  constructor(private rate = 1.08) {}

  stop() {
    this.isStopped = true;
    this.queue = [];
    if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }
  }

  push(sentence: string) {
    if (this.isStopped || !sentence.trim()) return;
    this.queue.push(sentence);
    if (!this.isBusy) this.processNext();
  }

  private async processNext() {
    this.isBusy = true;
    while (this.queue.length > 0 && !this.isStopped) {
      const text = this.queue.shift();
      if (text) await this.speak(text);
    }
    this.isBusy = false;
  }

  private speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.rate;
      utterance.lang = 'uz-UZ'; // O'zbek tili uchun
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }
}

/**
 * callAIStream: Anthropic API orqali javobni oqim (stream) shaklida oladi.
 * Eslatma: Bu demo uchun fetch ishlatadi, haqiqiy kalit kerak.
 */
export async function callAIStream(
  messages: any[], 
  system: string, 
  onToken: (token: string, fullText: string) => void
) {
  // Eslatma: Bu yerda haqiqiy API kalit va endpoint bo'lishi kerak.
  // Hozircha simulyatsiya qilamiz yoki foydalanuvchi taqdim etgan mantiqni qoldiramiz.
  
  // Haqiqiy Anthropic API chaqiruvi (proxy orqali yoki to'g'ridan-to'g'ri):
  /*
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      "x-api-key": "YOUR_KEY",
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      stream: true,
      system,
      messages
    })
  });
  */

  // Demo simulyatsiya (chunki API kalitimiz yo'q):
  const demoText = "Salom! Men AI-BOS yordamchisiman. Bugungi biznes ko'rsatkichlaringiz juda yaxshi. Daromad 15% ga oshgan, lekin marketing xarajatlarini biroz optimallashtirish kerak. Likvidlik xavfi past darajada.";
  const tokens = demoText.split(" ");
  let full = "";
  
  for (const token of tokens) {
    await new Promise(r => setTimeout(r, 100));
    full += token + " ";
    onToken(token + " ", full);
  }
  
  return full;
}
