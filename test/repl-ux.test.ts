/**
 * REPL UX visual behavior tests
 *
 * Tests rendered output of shell components using ink-testing-library.
 * Asserts on TEXT content (what the user sees), not internal state.
 * Written against component interfaces (props → rendered text) so that
 * implementation changes by Kovash don't break these tests.
 *
 * Components under test:
 * - MessageStream: conversation display, spinner, streaming cursor
 * - AgentPanel: team roster with status indicators
 * - InputPrompt: text input with history and disabled states
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';
import { MessageStream } from '../packages/squad-cli/src/cli/shell/components/MessageStream.js';
import { AgentPanel } from '../packages/squad-cli/src/cli/shell/components/AgentPanel.js';
import { InputPrompt } from '../packages/squad-cli/src/cli/shell/components/InputPrompt.js';
import { ThinkingIndicator, THINKING_PHRASES } from '../packages/squad-cli/src/cli/shell/components/ThinkingIndicator.js';
import type { ShellMessage, AgentSession } from '../packages/squad-cli/src/cli/shell/types.js';

// ============================================================================
// Test helpers
// ============================================================================

function makeAgent(overrides: Partial<AgentSession> & { name: string }): AgentSession {
  return {
    role: 'core dev',
    status: 'idle',
    startedAt: new Date(),
    ...overrides,
  };
}

function makeMessage(overrides: Partial<ShellMessage> & { content: string; role: ShellMessage['role'] }): ShellMessage {
  return {
    timestamp: new Date(),
    ...overrides,
  };
}

const h = React.createElement;

// ============================================================================
// 1. ThinkingIndicator visibility
// ============================================================================

describe('ThinkingIndicator visibility', () => {
  it('shows spinner when processing=true and no streaming content', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [makeMessage({ role: 'user', content: 'hello' })],
        processing: true,
        streamingContent: null,
      })
    );
    const frame = lastFrame()!;
    // Spinner frames are braille characters ⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏ plus 💭 label
    expect(frame).toMatch(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/);
  });

  it('spinner text includes agent name from @mention', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [makeMessage({ role: 'user', content: '@Kovash fix the bug' })],
        processing: true,
        streamingContent: null,
      })
    );
    const frame = lastFrame()!;
    expect(frame).toContain('Kovash');
    expect(frame).toContain('thinking');
  });

  it('shows thinking phrase when no @agent in message', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [makeMessage({ role: 'user', content: 'fix the bug' })],
        processing: true,
        streamingContent: null,
      })
    );
    const frame = lastFrame()!;
    // Now shows rotating thinking phrases instead of static "Routing"
    const hasPhrase = THINKING_PHRASES.some(p => frame.includes(p));
    expect(hasPhrase).toBe(true);
  });

  it('hides spinner when streaming content appears', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [makeMessage({ role: 'user', content: 'hello' })],
        processing: true,
        streamingContent: { agentName: 'Kovash', content: 'Working on it...' },
      })
    );
    const frame = lastFrame()!;
    expect(frame).toContain('Working on it...');
    expect(frame).toContain('▌');
  });

  it('spinner disappears when processing ends', () => {
    const { lastFrame, rerender } = render(
      h(MessageStream, {
        messages: [makeMessage({ role: 'user', content: 'hello' })],
        processing: true,
        streamingContent: null,
      })
    );
    expect(lastFrame()!).toMatch(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/);

    rerender(
      h(MessageStream, {
        messages: [
          makeMessage({ role: 'user', content: 'hello' }),
          makeMessage({ role: 'agent', content: 'Done!', agentName: 'Kovash' }),
        ],
        processing: false,
        streamingContent: null,
      })
    );
    const frame = lastFrame()!;
    expect(frame).not.toMatch(/thinking/i);
    expect(frame).toContain('Done!');
  });
});

// ============================================================================
// 2. AgentPanel status display
// ============================================================================

describe('AgentPanel status display', () => {
  it('renders nothing when agents list is empty', () => {
    const { lastFrame } = render(h(AgentPanel, { agents: [] }));
    expect(lastFrame()).toBe('');
  });

  it('shows agent names in roster', () => {
    const agents = [
      makeAgent({ name: 'Kovash', role: 'core dev', status: 'idle' }),
      makeAgent({ name: 'Hockney', role: 'tester', status: 'idle' }),
    ];
    const { lastFrame } = render(h(AgentPanel, { agents }));
    const frame = lastFrame()!;
    expect(frame).toContain('Kovash');
    expect(frame).toContain('Hockney');
  });

  it('idle agents show "idle" status text', () => {
    const agents = [makeAgent({ name: 'Kovash', status: 'idle' })];
    const { lastFrame } = render(h(AgentPanel, { agents }));
    expect(lastFrame()!.toLowerCase()).toContain('idle');
  });

  it('working agents show active indicator ●', () => {
    const agents = [
      makeAgent({ name: 'Kovash', status: 'working' }),
      makeAgent({ name: 'Hockney', status: 'idle' }),
    ];
    const { lastFrame } = render(h(AgentPanel, { agents }));
    const frame = lastFrame()!;
    expect(frame).toContain('●');
  });

  it('streaming agents show active indicator ●', () => {
    const agents = [makeAgent({ name: 'Kovash', status: 'streaming' })];
    const { lastFrame } = render(h(AgentPanel, { agents }));
    expect(lastFrame()!).toContain('●');
  });

  it('error agents show error indicator ✖', () => {
    const agents = [makeAgent({ name: 'Kovash', status: 'error' })];
    const { lastFrame } = render(h(AgentPanel, { agents }));
    expect(lastFrame()!).toContain('✖');
  });

  it('shows streaming status when streamingContent references agent', () => {
    const agents = [makeAgent({ name: 'Kovash', status: 'streaming' })];
    const { lastFrame } = render(
      h(AgentPanel, {
        agents,
        streamingContent: { agentName: 'Kovash', content: 'some response' },
      })
    );
    const frame = lastFrame()!;
    expect(frame).toContain('Kovash');
    expect(frame).toContain('streaming');
  });

  it('mixed statuses render correctly together', () => {
    const agents = [
      makeAgent({ name: 'Brady', role: 'lead', status: 'idle' }),
      makeAgent({ name: 'Kovash', role: 'core dev', status: 'working' }),
      makeAgent({ name: 'Hockney', role: 'tester', status: 'error' }),
    ];
    const { lastFrame } = render(h(AgentPanel, { agents }));
    const frame = lastFrame()!;
    expect(frame).toContain('Brady');
    expect(frame).toContain('Kovash');
    expect(frame).toContain('Hockney');
    expect(frame).toContain('●');
    expect(frame).toContain('✖');
  });
});

// ============================================================================
// 3. MessageStream formatting
// ============================================================================

describe('MessageStream formatting', () => {
  it('user messages show "you:" prefix', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [makeMessage({ role: 'user', content: 'hello world' })],
      })
    );
    const frame = lastFrame()!;
    expect(frame).toContain('you:');
    expect(frame).toContain('hello world');
  });

  it('agent messages show agent name with emoji', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [makeMessage({ role: 'agent', content: 'I will fix it', agentName: 'Kovash' })],
        agents: [makeAgent({ name: 'Kovash', role: 'core dev' })],
      })
    );
    const frame = lastFrame()!;
    expect(frame).toContain('Kovash');
    expect(frame).toContain('I will fix it');
    // core dev emoji is 🔧
    expect(frame).toContain('🔧');
  });

  it('tester agent shows tester emoji 🧪', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [makeMessage({ role: 'agent', content: 'tests pass', agentName: 'Hockney' })],
        agents: [makeAgent({ name: 'Hockney', role: 'tester' })],
      })
    );
    expect(lastFrame()!).toContain('🧪');
  });

  it('system messages show system prefix', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [makeMessage({ role: 'system', content: 'Agent spawned' })],
      })
    );
    const frame = lastFrame()!;
    expect(frame).toContain('system');
    expect(frame).toContain('Agent spawned');
  });

  it('horizontal rule appears between conversation turns', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [
          makeMessage({ role: 'user', content: 'first question' }),
          makeMessage({ role: 'agent', content: 'first answer', agentName: 'Kovash' }),
          makeMessage({ role: 'user', content: 'second question' }),
        ],
      })
    );
    expect(lastFrame()!).toContain('─');
  });

  it('no horizontal rule before the first message', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [makeMessage({ role: 'user', content: 'first question' })],
      })
    );
    const frame = lastFrame()!;
    expect(frame).toContain('first question');
    expect(frame).not.toContain('─');
  });

  it('streaming content shows cursor character ▌', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [],
        streamingContent: { agentName: 'Kovash', content: 'partial response' },
      })
    );
    const frame = lastFrame()!;
    expect(frame).toContain('partial response');
    expect(frame).toContain('▌');
  });

  it('streaming content shows agent name', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [],
        streamingContent: { agentName: 'Kovash', content: 'streaming text' },
        agents: [makeAgent({ name: 'Kovash', role: 'core dev' })],
      })
    );
    expect(lastFrame()!).toContain('Kovash');
  });

  it('respects maxVisible prop — only shows last N messages', () => {
    const messages = Array.from({ length: 10 }, (_, i) =>
      makeMessage({ role: 'user', content: `message-${i}` })
    );
    const { lastFrame } = render(
      h(MessageStream, { messages, maxVisible: 3 })
    );
    const frame = lastFrame()!;
    expect(frame).toContain('message-9');
    expect(frame).toContain('message-8');
    expect(frame).toContain('message-7');
    expect(frame).not.toContain('message-0');
  });
});

// ============================================================================
// 4. InputPrompt behavior
// ============================================================================

describe('InputPrompt behavior', () => {
  it('shows cursor ▌ when not disabled', () => {
    const { lastFrame } = render(
      h(InputPrompt, { onSubmit: vi.fn(), disabled: false })
    );
    expect(lastFrame()!).toContain('▌');
  });

  it('hides cursor when disabled', () => {
    const { lastFrame } = render(
      h(InputPrompt, { onSubmit: vi.fn(), disabled: true })
    );
    expect(lastFrame()!).not.toContain('▌');
  });

  it('shows custom prompt text', () => {
    const { lastFrame } = render(
      h(InputPrompt, { onSubmit: vi.fn(), prompt: 'squad> ' })
    );
    expect(lastFrame()!).toContain('squad>');
  });

  it('disabled prompt shows spinner animation', () => {
    const { lastFrame } = render(
      h(InputPrompt, {
        onSubmit: vi.fn(),
        disabled: true,
      })
    );
    const frame = lastFrame()!;
    // Kovash's refactored InputPrompt shows ◆ squad + spinner when disabled
    expect(frame).toContain('squad');
    expect(frame).toMatch(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/);
  });

  it('accepts text input via stdin (character by character)', async () => {
    const { lastFrame, stdin } = render(
      h(InputPrompt, { onSubmit: vi.fn(), disabled: false })
    );
    // Ink v6 processes stdin events — flush microtasks after write
    stdin.write('h');
    stdin.write('e');
    stdin.write('l');
    stdin.write('l');
    stdin.write('o');
    await new Promise(r => setTimeout(r, 50));
    expect(lastFrame()!).toContain('hello');
  });

  it('submits on enter and clears input', async () => {
    const onSubmit = vi.fn();
    const { lastFrame, stdin } = render(
      h(InputPrompt, { onSubmit, disabled: false })
    );
    for (const ch of 'test input') stdin.write(ch);
    await new Promise(r => setTimeout(r, 50));
    stdin.write('\r');
    await new Promise(r => setTimeout(r, 50));
    expect(onSubmit).toHaveBeenCalledWith('test input');
    expect(lastFrame()!).not.toContain('test input');
  });

  it('does not submit empty input', () => {
    const onSubmit = vi.fn();
    const { stdin } = render(
      h(InputPrompt, { onSubmit, disabled: false })
    );
    stdin.write('\r');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('ignores input when disabled', () => {
    const onSubmit = vi.fn();
    const { stdin } = render(
      h(InputPrompt, { onSubmit, disabled: true })
    );
    stdin.write('should not work');
    stdin.write('\r');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('up arrow shows previous input from history', async () => {
    const onSubmit = vi.fn();
    const { lastFrame, stdin } = render(
      h(InputPrompt, { onSubmit, disabled: false })
    );
    for (const ch of 'first') stdin.write(ch);
    await new Promise(r => setTimeout(r, 50));
    stdin.write('\r');
    await new Promise(r => setTimeout(r, 50));
    for (const ch of 'second') stdin.write(ch);
    await new Promise(r => setTimeout(r, 50));
    stdin.write('\r');
    await new Promise(r => setTimeout(r, 50));
    // Up arrow escape sequence
    stdin.write('\x1B[A');
    await new Promise(r => setTimeout(r, 50));
    expect(lastFrame()!).toContain('second');
  });

  it('down arrow clears after history navigation', async () => {
    const onSubmit = vi.fn();
    const { lastFrame, stdin } = render(
      h(InputPrompt, { onSubmit, disabled: false })
    );
    for (const ch of 'first') stdin.write(ch);
    await new Promise(r => setTimeout(r, 50));
    stdin.write('\r');
    await new Promise(r => setTimeout(r, 50));
    stdin.write('\x1B[A'); // Up to get "first"
    await new Promise(r => setTimeout(r, 50));
    expect(lastFrame()!).toContain('first');
    stdin.write('\x1B[B'); // Down past end of history
    await new Promise(r => setTimeout(r, 50));
    expect(lastFrame()!).not.toContain('first');
  });
});

// ============================================================================
// 5. Welcome experience
// ============================================================================

describe('Welcome experience', () => {
  it('empty agent list renders no panel', () => {
    const { lastFrame } = render(h(AgentPanel, { agents: [] }));
    expect(lastFrame()).toBe('');
  });

  it('agent roster displays all team members', () => {
    const agents = [
      makeAgent({ name: 'Brady', role: 'lead', status: 'idle' }),
      makeAgent({ name: 'Kovash', role: 'core dev', status: 'idle' }),
      makeAgent({ name: 'Hockney', role: 'tester', status: 'idle' }),
    ];
    const { lastFrame } = render(h(AgentPanel, { agents }));
    const frame = lastFrame()!;
    expect(frame).toContain('Brady');
    expect(frame).toContain('Kovash');
    expect(frame).toContain('Hockney');
    // Should show idle status for the team
    expect(frame.toLowerCase()).toContain('idle');
  });

  it('MessageStream with no messages and no processing shows empty area', () => {
    const { lastFrame } = render(
      h(MessageStream, { messages: [], processing: false })
    );
    // Should be a valid frame (not null), may be empty or whitespace
    const frame = lastFrame();
    expect(frame).toBeDefined();
  });
});

// ============================================================================
// 6. "Never feels dead" — processing lifecycle
// ============================================================================

describe('Never feels dead', () => {
  it('processing=true immediately shows spinner', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [makeMessage({ role: 'user', content: 'do something' })],
        processing: true,
        streamingContent: null,
      })
    );
    const frame = lastFrame()!;
    expect(frame.trim().length).toBeGreaterThan(0);
    expect(frame).toMatch(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]|💭/);
  });

  it('streaming phase shows content with cursor', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [makeMessage({ role: 'user', content: 'do something' })],
        processing: true,
        streamingContent: { agentName: 'Kovash', content: 'Working...' },
      })
    );
    const frame = lastFrame()!;
    expect(frame.trim().length).toBeGreaterThan(0);
    expect(frame).toContain('Working...');
    expect(frame).toContain('▌');
  });

  it('full lifecycle: processing → streaming → done, screen always has content', () => {
    const { lastFrame, rerender } = render(
      h(MessageStream, {
        messages: [makeMessage({ role: 'user', content: 'hello' })],
        processing: true,
        streamingContent: null,
      })
    );

    // Phase 1: Processing — spinner visible
    expect(lastFrame()!).toMatch(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/);

    // Phase 2: Streaming begins
    rerender(
      h(MessageStream, {
        messages: [makeMessage({ role: 'user', content: 'hello' })],
        processing: true,
        streamingContent: { agentName: 'Kovash', content: 'Partial...' },
      })
    );
    expect(lastFrame()!).toContain('Partial...');
    expect(lastFrame()!).toContain('▌');

    // Phase 3: Streaming ends — final message
    rerender(
      h(MessageStream, {
        messages: [
          makeMessage({ role: 'user', content: 'hello' }),
          makeMessage({ role: 'agent', content: 'Complete answer.', agentName: 'Kovash' }),
        ],
        processing: false,
        streamingContent: null,
      })
    );
    const finalFrame = lastFrame()!;
    expect(finalFrame).toContain('Complete answer.');
    expect(finalFrame).not.toMatch(/thinking/i);
    // No spinner in final state
    expect(finalFrame).not.toMatch(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/);
  });

  it('InputPrompt re-enables after processing completes', () => {
    const { lastFrame, rerender } = render(
      h(InputPrompt, {
        onSubmit: vi.fn(),
        disabled: true,
      })
    );
    // Disabled state: spinner visible, no text cursor
    expect(lastFrame()!).not.toContain('▌');
    expect(lastFrame()!).toMatch(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/);

    rerender(
      h(InputPrompt, {
        onSubmit: vi.fn(),
        disabled: false,
      })
    );
    const frame = lastFrame()!;
    // Re-enabled: text cursor visible, no spinner
    expect(frame).toContain('▌');
    expect(frame).toContain('squad');
    expect(frame).not.toMatch(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/);
  });

  it('every lifecycle phase has visible content (no dead frames)', () => {
    type Phase = {
      processing: boolean;
      streamingContent: { agentName: string; content: string } | null;
      messages: ShellMessage[];
    };

    const phases: Phase[] = [
      {
        processing: true,
        streamingContent: null,
        messages: [makeMessage({ role: 'user', content: 'question' })],
      },
      {
        processing: true,
        streamingContent: { agentName: 'Kovash', content: 'Starting...' },
        messages: [makeMessage({ role: 'user', content: 'question' })],
      },
      {
        processing: true,
        streamingContent: { agentName: 'Kovash', content: 'More content here...' },
        messages: [makeMessage({ role: 'user', content: 'question' })],
      },
      {
        processing: false,
        streamingContent: null,
        messages: [
          makeMessage({ role: 'user', content: 'question' }),
          makeMessage({ role: 'agent', content: 'Full answer.', agentName: 'Kovash' }),
        ],
      },
    ];

    const { lastFrame, rerender } = render(h(MessageStream, phases[0]!));

    for (let i = 0; i < phases.length; i++) {
      if (i > 0) rerender(h(MessageStream, phases[i]!));
      const frame = lastFrame();
      expect(frame, `Phase ${i + 1} must not be null`).toBeTruthy();
      expect(frame!.trim().length, `Phase ${i + 1} must have visible content`).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// 7. ThinkingIndicator component (standalone)
// ============================================================================

describe('ThinkingIndicator component', () => {
  it('renders nothing when isThinking=false', () => {
    const { lastFrame } = render(
      h(ThinkingIndicator, { isThinking: false, elapsedMs: 0 })
    );
    expect(lastFrame()).toBe('');
  });

  it('renders spinner when isThinking=true', () => {
    const { lastFrame } = render(
      h(ThinkingIndicator, { isThinking: true, elapsedMs: 0 })
    );
    const frame = lastFrame()!;
    expect(frame).toMatch(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/);
  });

  it('shows a thinking phrase from the THINKING_PHRASES list', () => {
    const { lastFrame } = render(
      h(ThinkingIndicator, { isThinking: true, elapsedMs: 0 })
    );
    const frame = lastFrame()!;
    const hasPhrase = THINKING_PHRASES.some(p => frame.includes(p));
    expect(hasPhrase).toBe(true);
  });

  it('shows elapsed time when > 0', () => {
    const { lastFrame } = render(
      h(ThinkingIndicator, { isThinking: true, elapsedMs: 12000 })
    );
    expect(lastFrame()!).toContain('12s');
  });

  it('does not show elapsed time when < 1s', () => {
    const { lastFrame } = render(
      h(ThinkingIndicator, { isThinking: true, elapsedMs: 500 })
    );
    expect(lastFrame()!).not.toMatch(/\d+s/);
  });

  it('activity hint takes priority over thinking phrases', () => {
    const { lastFrame } = render(
      h(ThinkingIndicator, {
        isThinking: true,
        elapsedMs: 5000,
        activityHint: 'Reading file...',
      })
    );
    const frame = lastFrame()!;
    expect(frame).toContain('Reading file...');
    // Should NOT show any thinking phrase when hint is active
    const hasPhrase = THINKING_PHRASES.some(p => frame.includes(p));
    expect(hasPhrase).toBe(false);
  });

  it('activity hint shows elapsed time alongside', () => {
    const { lastFrame } = render(
      h(ThinkingIndicator, {
        isThinking: true,
        elapsedMs: 8000,
        activityHint: 'Spawning specialist...',
      })
    );
    const frame = lastFrame()!;
    expect(frame).toContain('Spawning specialist...');
    expect(frame).toContain('8s');
  });

  it('THINKING_PHRASES has at least 8 entries for variety', () => {
    expect(THINKING_PHRASES.length).toBeGreaterThanOrEqual(8);
  });
});

// ============================================================================
// 8. ThinkingIndicator integration with MessageStream
// ============================================================================

describe('ThinkingIndicator integration with MessageStream', () => {
  it('shows thinking phrase when processing with no @mention', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [makeMessage({ role: 'user', content: 'fix the bug' })],
        processing: true,
        streamingContent: null,
      })
    );
    const frame = lastFrame()!;
    // Should show spinner and a thinking phrase
    expect(frame).toMatch(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/);
    const hasPhrase = THINKING_PHRASES.some(p => frame.includes(p));
    expect(hasPhrase).toBe(true);
  });

  it('shows agent-specific hint when @mention present', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [makeMessage({ role: 'user', content: '@Kovash fix the bug' })],
        processing: true,
        streamingContent: null,
      })
    );
    const frame = lastFrame()!;
    expect(frame).toContain('Kovash');
    expect(frame).toContain('thinking');
  });

  it('shows custom activityHint when provided', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [makeMessage({ role: 'user', content: 'hello' })],
        processing: true,
        streamingContent: null,
        activityHint: 'Analyzing dependencies...',
      })
    );
    expect(lastFrame()!).toContain('Analyzing dependencies...');
  });

  it('activityHint overrides @mention hint', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [makeMessage({ role: 'user', content: '@Kovash fix it' })],
        processing: true,
        streamingContent: null,
        activityHint: 'Reading file...',
      })
    );
    const frame = lastFrame()!;
    expect(frame).toContain('Reading file...');
  });

  it('streaming phase shows agent name + streaming hint', () => {
    const { lastFrame } = render(
      h(MessageStream, {
        messages: [makeMessage({ role: 'user', content: 'hello' })],
        processing: true,
        streamingContent: { agentName: 'Kovash', content: 'Working on it...' },
      })
    );
    const frame = lastFrame()!;
    expect(frame).toContain('Working on it...');
    expect(frame).toContain('streaming');
  });
});
