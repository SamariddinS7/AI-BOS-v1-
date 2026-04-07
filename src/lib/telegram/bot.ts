import TelegramBot from 'node-telegram-bot-api';
import db from '../db/settings';
import { processAICommand } from '../ai/agent';

let currentBot: TelegramBot | null = null;

export async function startTelegramBot(tenantId: string = 'default-tenant-id') {
  if (currentBot) {
    await stopTelegramBot();
  }

  const settings = db.prepare('SELECT * FROM TelegramSettings WHERE tenant_id = ?').get(tenantId) as any;
  if (!settings || !settings.bot_token || !settings.is_active) {
    return false;
  }

  try {
    currentBot = new TelegramBot(settings.bot_token, { polling: true });

    currentBot.on('message', async (msg) => {
      if (!msg.text) return;
      
      // Save user message
      db.prepare('INSERT INTO TelegramMessages (tenant_id, chat_id, username, text, is_bot) VALUES (?, ?, ?, ?, 0)').run(
        tenantId, msg.chat.id.toString(), msg.from?.username || msg.from?.first_name || 'User', msg.text
      );

      // Re-fetch settings to ensure we have the latest
      const currentSettings = db.prepare('SELECT * FROM TelegramSettings WHERE tenant_id = ?').get(tenantId) as any;
      if (!currentSettings || !currentSettings.auto_reply) return;

      try {
        let replyText = '';
        if (currentSettings.use_custom_code && currentSettings.custom_code) {
          // Evaluate custom code safely
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          const callAI = async (prompt: string, system: string) => {
            return await processAICommand(prompt, system, 'uz');
          };
          
          const userFunc = new AsyncFunction('msg', 'sysPrompt', 'callAI', currentSettings.custom_code);
          replyText = await userFunc(msg, currentSettings.system_prompt, callAI);
        } else {
          // Default AI reply with tools
          replyText = await processAICommand(msg.text, currentSettings.system_prompt, 'uz');
        }

        if (replyText) {
          currentBot?.sendMessage(msg.chat.id, replyText, { reply_to_message_id: msg.message_id });
          // Save bot message
          db.prepare('INSERT INTO TelegramMessages (tenant_id, chat_id, username, text, is_bot) VALUES (?, ?, ?, ?, 1)').run(
            tenantId, msg.chat.id.toString(), 'AI-BOS Bot', replyText
          );
        }
      } catch (error: any) {
        console.error('Telegram bot error:', error);
        currentBot?.sendMessage(msg.chat.id, "Xatolik yuz berdi: " + error.message, { reply_to_message_id: msg.message_id });
      }
    });

    currentBot.on('polling_error', (error) => {
      console.error('Telegram polling error:', error);
    });

    return true;
  } catch (error) {
    console.error('Failed to start Telegram bot:', error);
    return false;
  }
}

export async function stopTelegramBot() {
  if (currentBot) {
    try {
      await currentBot.stopPolling();
    } catch (e) {
      console.error('Error stopping bot:', e);
    }
    currentBot = null;
  }
}

export function getTelegramBotStatus() {
  return currentBot !== null && currentBot.isPolling();
}

// Auto-start on boot
setTimeout(() => {
  startTelegramBot().catch(console.error);
}, 2000);
