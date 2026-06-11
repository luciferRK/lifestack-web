import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { VoiceAgentWidget } from './VoiceAgentWidget';

class MockAudioContext {
  state = 'running';
  currentTime = 0;
  destination = {};

  resume = vi.fn(() => Promise.resolve());
  close = vi.fn(() => Promise.resolve());
  createBuffer = vi.fn(() => ({
    duration: 0,
    getChannelData: () => new Float32Array(),
  }));
  createBufferSource = vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null,
  }));
}

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  static instances: MockWebSocket[] = [];

  readyState = MockWebSocket.CONNECTING;
  binaryType: BinaryType = 'blob';
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  url: string;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send = vi.fn();

  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code: 1000 } as CloseEvent);
  });
}

const renderWithQuery = (ui: React.ReactNode) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('VoiceAgentWidget', () => {
  const originalAudioContext = window.AudioContext;
  const originalWebSocket = window.WebSocket;
  const originalScrollIntoView = Element.prototype.scrollIntoView;

  beforeEach(() => {
    MockWebSocket.instances = [];
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: MockAudioContext,
    });
    Object.defineProperty(window, 'WebSocket', {
      configurable: true,
      value: MockWebSocket,
    });
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: originalAudioContext,
    });
    Object.defineProperty(window, 'WebSocket', {
      configurable: true,
      value: originalWebSocket,
    });
    Element.prototype.scrollIntoView = originalScrollIntoView;
  });

  it('shows a retryable failure state when the voice session connection fails', () => {
    renderWithQuery(<VoiceAgentWidget />);

    fireEvent.click(screen.getByLabelText('Open voice copilot'));
    expect(MockWebSocket.instances).toHaveLength(1);

    act(() => {
      MockWebSocket.instances[0].onerror?.(new Event('error'));
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Voice session needs attention');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Voice Copilot could not connect to the live session.',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(MockWebSocket.instances).toHaveLength(2);
  });
});
