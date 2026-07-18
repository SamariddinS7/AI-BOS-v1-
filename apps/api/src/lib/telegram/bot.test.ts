import { describe, it, expect, vi, beforeEach } from 'vitest';
import TelegramBot from 'node-telegram-bot-api';
import { startTelegramBot, stopTelegramBot, getTelegramBotStatus } from './bot';
import db from '../db/settings';
import { processAICommand } from '../ai/agent';

// Mock dependencies
const mockBotInstance = {
  on: vi.fn(),
  sendMessage: vi.fn(),
  stopPolling: vi.fn().mockResolvedValue(undefined),
  isPolling: vi.fn().mockReturnValue(true),
};

vi.mock('node-telegram-bot-api', () => {
  return {
    default: vi.fn().mockImplementation(function() {
      return mockBotInstance;
    })
  };
});
vi.mock('../db/settings', () => ({
  default: {
    prepare: vi.fn().mockReturnValue({
      get: vi.fn(),
      run: vi.fn(),
      all: vi.fn(),
    }),
  },
}));
vi.mock('../ai/agent', () => ({
  processAICommand: vi.fn(),
}));

describe('Telegram Bot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
  });

  it('should start the bot if token is provided in env', async () => {
    const mockGet = vi.fn().mockReturnValue({ bot_token: 'test-token', is_active: 1 });
    (db.prepare as any).mockReturnValue({ get: mockGet });

    const result = await startTelegramBot();
    expect(result).toBe(true);
    expect(TelegramBot).toHaveBeenCalledWith('test-token', { polling: true });
    expect(getTelegramBotStatus()).toBe(true);
  });

  it('should not start the bot if token is missing', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    const mockGet = vi.fn().mockReturnValue(null);
    (db.prepare as any).mockReturnValue({ get: mockGet });

    const result = await startTelegramBot();
    expect(result).toBe(false);
    expect(TelegramBot).not.toHaveBeenCalled();
  });

  it('should stop the bot', async () => {
    const mockGet = vi.fn().mockReturnValue({ bot_token: 'test-token', is_active: 1 });
    (db.prepare as any).mockReturnValue({ get: mockGet });

    await startTelegramBot();
    await stopTelegramBot();
    expect(getTelegramBotStatus()).toBe(false);
  });

  it('should handle incoming messages and reply using AI', async () => {
    const mockGet = vi.fn().mockReturnValue({ 
      bot_token: 'test-token', 
      is_active: 1,
      auto_reply: 1,
      use_custom_code: 0,
      system_prompt: 'test prompt'
    });
    const mockRun = vi.fn();
    (db.prepare as any).mockReturnValue({ get: mockGet, run: mockRun });
    (processAICommand as any).mockResolvedValue('AI Response');

    await startTelegramBot();

    // Get the 'message' listener
    const messageHandler = mockBotInstance.on.mock.calls.find((call: any) => call[0] === 'message')[1];

    const mockMsg = {
      text: 'Hello',
      chat: { id: 123 },
      from: { username: 'testuser' },
      message_id: 456
    };

    await messageHandler(mockMsg);

    expect(processAICommand).toHaveBeenCalledWith('Hello', 'test prompt', 'uz');
    expect(mockBotInstance.sendMessage).toHaveBeenCalledWith(123, 'AI Response', { reply_to_message_id: 456 });
    expect(mockRun).toHaveBeenCalled(); // Should save messages to DB
  });
});
