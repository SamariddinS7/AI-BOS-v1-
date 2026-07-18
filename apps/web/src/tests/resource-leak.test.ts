import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';

// Mock the Auth Context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'boshqahramon0@gmail.com', emailVerified: true },
    isLoading: false,
    signOut: vi.fn(),
  }),
}));

// Mock the Language Context
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'uz',
    t: (key: string) => key,
    setLanguage: vi.fn(),
  }),
}));

// Mock the Settings Context
vi.mock('../contexts/SettingsContext', () => ({
  useSettings: () => ({
    settings: { language: 'uz', theme: 'dark' },
    updateSettings: vi.fn(),
  }),
}));

// Mock modules that connect to external or DB resources or use canvas APIs
vi.mock('../lib/db/settings', () => ({
  default: {
    prepare: vi.fn().mockReturnValue({
      run: vi.fn(),
      get: vi.fn().mockReturnValue({ status: 'completed' }),
      all: vi.fn().mockReturnValue([]),
    }),
  },
}));

// Standard Audio API / Media mocks to prevent JSDOM errors
global.AudioContext = vi.fn().mockImplementation(() => ({
  createMediaStreamSource: vi.fn().mockReturnValue({
    connect: vi.fn(),
  }),
  createAnalyser: vi.fn().mockReturnValue({
    fftSize: 256,
  }),
  close: vi.fn().mockResolvedValue(undefined),
})) as any;

global.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  state: 'inactive',
  stream: {
    getTracks: vi.fn().mockReturnValue([]),
  },
})) as any;

Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: vi.fn().mockReturnValue([]),
    }),
  },
  writable: true,
});

// Mock Web Speech APIs
global.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn().mockReturnValue([]),
  onvoiceschanged: null,
  paused: false,
  pending: false,
  speaking: false,
} as any;

global.SpeechSynthesisUtterance = vi.fn().mockImplementation(() => ({
  text: '',
  lang: 'en-US',
  pitch: 1.0,
  rate: 1.0,
  voice: null,
  volume: 1.0,
  onend: null,
  onerror: null,
  onstart: null,
})) as any;

// Mock HTMLCanvasElement.prototype.getContext to bypass JSDOM limitations
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => ({
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  createRadialGradient: vi.fn().mockReturnValue({
    addColorStop: vi.fn(),
  }),
  filter: '',
  fillStyle: '',
})) as any;

describe('App Component Mounting Leak Stress Test', () => {
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;
  const originalDocAddEventListener = document.addEventListener;
  const originalDocRemoveEventListener = document.removeEventListener;
  const originalSetInterval = global.setInterval;
  const originalClearInterval = global.clearInterval;
  const originalSetTimeout = global.setTimeout;
  const originalClearTimeout = global.clearTimeout;

  interface Tracker {
    type: string;
    listener: any;
    options?: any;
  }

  const activeWindowListeners: Tracker[] = [];
  const activeDocListeners: Tracker[] = [];
  const activeIntervals = new Set<any>();
  const activeTimeouts = new Set<any>();

  beforeEach(() => {
    activeWindowListeners.length = 0;
    activeDocListeners.length = 0;
    activeIntervals.clear();
    activeTimeouts.clear();

    window.addEventListener = function (type: string, listener: any, options?: any) {
      activeWindowListeners.push({ type, listener, options });
      originalAddEventListener.call(window, type, listener, options);
    };

    window.removeEventListener = function (type: string, listener: any, options?: any) {
      const idx = activeWindowListeners.findIndex(
        (item) => item.type === type && item.listener === listener
      );
      if (idx !== -1) {
        activeWindowListeners.splice(idx, 1);
      }
      originalRemoveEventListener.call(window, type, listener, options);
    };

    document.addEventListener = function (type: string, listener: any, options?: any) {
      activeDocListeners.push({ type, listener, options });
      originalDocAddEventListener.call(document, type, listener, options);
    };

    document.removeEventListener = function (type: string, listener: any, options?: any) {
      const idx = activeDocListeners.findIndex(
        (item) => item.type === type && item.listener === listener
      );
      if (idx !== -1) {
        activeDocListeners.splice(idx, 1);
      }
      originalDocRemoveEventListener.call(document, type, listener, options);
    };

    global.setInterval = (function (handler: TimerHandler, timeout?: number, ...args: any[]) {
      const id = originalSetInterval(handler, timeout, ...args);
      activeIntervals.add(id);
      return id as any;
    }) as any;

    global.clearInterval = (function (id: any) {
      activeIntervals.delete(id);
      originalClearInterval(id);
    }) as any;

    global.setTimeout = (function (handler: TimerHandler, timeout?: number, ...args: any[]) {
      const id = originalSetTimeout(handler, timeout, ...args);
      activeTimeouts.add(id);
      return id as any;
    }) as any;

    global.clearTimeout = (function (id: any) {
      activeTimeouts.delete(id);
      originalClearTimeout(id);
    }) as any;
  });

  afterEach(() => {
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
    document.addEventListener = originalDocAddEventListener;
    document.removeEventListener = originalDocRemoveEventListener;
    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
  });

  it('verifies event listeners and timers are cleanly disposed when App mounts and unmounts repeatedly', async () => {
    // Record baseline counts before any App renders
    const baseWindowCount = activeWindowListeners.length;
    const baseDocCount = activeDocListeners.length;
    const baseIntervalCount = activeIntervals.size;

    console.log(`[Leak Test] Baseline counts -> Window listeners: ${baseWindowCount}, Doc listeners: ${baseDocCount}, Intervals: ${baseIntervalCount}`);

    // Stress test: mount and unmount App 10 times sequentially
    const iterations = 10;
    for (let i = 0; i < iterations; i++) {
      const { unmount } = render(React.createElement(App));
      unmount();
    }

    // Capture counts after all unmount operations have completed
    const finalWindowCount = activeWindowListeners.length;
    const finalDocCount = activeDocListeners.length;
    const finalIntervalCount = activeIntervals.size;

    console.log(`[Leak Test] Post-cleanup counts -> Window listeners: ${finalWindowCount}, Doc listeners: ${finalDocCount}, Intervals: ${finalIntervalCount}`);

    // Expect that any listener or interval created during rendering/mounting is properly cleared.
    // There shouldn't be an accumulating/scaling increase across the iterations.
    // If there were a leak, counts would grow by iterations * leak_size (e.g. at least 10-20 extra listeners).
    // Note: Framer motion uses a single static global requestAnimationFrame loop under JSDOM which registers exactly 1 interval.
    expect(finalWindowCount).toBeLessThanOrEqual(baseWindowCount + 2); // 2 is a safe buffer for any external/lazy-init side-effects
    expect(finalDocCount).toBeLessThanOrEqual(baseDocCount + 2);
    expect(finalIntervalCount).toBeLessThanOrEqual(baseIntervalCount + 1); // accounts for JSDOM's global requestAnimationFrame loop
  });
});
