import TelegramBot from 'node-telegram-bot-api';
import db from '../db/settings';
import { processAICommand } from '../ai/agent';

let currentBot: TelegramBot | null = null;
let isStarting = false;

export async function startTelegramBot(tenantId: string = 'default-tenant-id') {
  if (isStarting) {
    console.log('Telegram bot is already starting, skipping...');
    return false;
  }
  isStarting = true;

  try {
    if (currentBot) {
      console.log('Stopping existing Telegram bot instance before restart...');
      await stopTelegramBot();
      // Wait a bit for the connection to fully close
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const settings = db.prepare('SELECT * FROM TelegramSettings WHERE tenant_id = ?').get(tenantId) as any;
    const botToken = settings?.bot_token || process.env.TELEGRAM_BOT_TOKEN;
    const isActive = settings?.is_active || (process.env.TELEGRAM_BOT_TOKEN ? 1 : 0);

    if (!botToken || !isActive) {
      console.log('Telegram bot not started: Missing token or inactive.');
      return false;
    }

    console.log('Initializing Telegram bot...');
    currentBot = new TelegramBot(botToken, { polling: false });
    
    // Clear any existing webhooks or polling sessions
    try {
      await currentBot.deleteWebHook();
      console.log('Telegram webhook cleared.');
    } catch (whError) {
      console.warn('Error clearing Telegram webhook (non-fatal):', whError);
    }
    
    // Small delay to allow previous sessions to clear
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Attach event listeners before starting polling to catch initial errors
    currentBot.on('error', (error) => {
      console.error('Telegram bot error:', error);
    });

    currentBot.on('polling_error', (error: any) => {
      // Ignore 409 errors during startup or dev restart as they are often transient
      if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
        console.warn('Telegram polling conflict (409) detected. Another instance is running, but we will keep retrying.');
        return;
      }
      console.error('Telegram polling error:', error);
    });

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

    // Retry logic for polling start
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`Starting Telegram polling (attempt ${retryCount + 1})...`);
        await currentBot.startPolling();
        console.log('Telegram bot polling started successfully.');
        break;
      } catch (pollError: any) {
        retryCount++;
        if (pollError.code === 'ETELEGRAM' && pollError.message.includes('409 Conflict')) {
          console.warn(`Telegram polling conflict (409) on startup. Retrying in 5s... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          if (retryCount === maxRetries) {
            throw pollError;
          }
        } else {
          throw pollError;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to start Telegram bot:', error);
    return false;
  } finally {
    isStarting = false;
  }
}

export async function stopTelegramBot() {
  if (currentBot) {
    try {
      currentBot.removeAllListeners();
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

// Graceful shutdown
process.on('SIGINT', async () => {
  await stopTelegramBot();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await stopTelegramBot();
  process.exit(0);
});
