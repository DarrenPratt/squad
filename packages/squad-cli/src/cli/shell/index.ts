/**
 * Squad Interactive Shell — entry point
 *
 * Renders the Ink-based shell UI with AgentPanel, MessageStream, and InputPrompt.
 * Manages CopilotSDK sessions and routes messages to agents/coordinator.
 */

import { createRequire } from 'node:module';
import React from 'react';
import { render } from 'ink';
import { App } from './components/App.js';
import type { ShellApi } from './components/App.js';
import { SessionRegistry } from './sessions.js';
import { ShellRenderer } from './render.js';
import { StreamBridge } from './stream-bridge.js';
import { ShellLifecycle } from './lifecycle.js';
import { SquadClient } from '@bradygaster/squad-sdk/client';
import type { SquadSession } from '@bradygaster/squad-sdk/client';
import { initSquadTelemetry, TIMEOUTS } from '@bradygaster/squad-sdk';
import { buildCoordinatorPrompt, parseCoordinatorResponse } from './coordinator.js';
import { loadAgentCharter, buildAgentPrompt } from './spawn.js';
import type { ParsedInput } from './router.js';

export { SessionRegistry } from './sessions.js';
export { StreamBridge } from './stream-bridge.js';
export type { StreamBridgeOptions } from './stream-bridge.js';
export { ShellRenderer } from './render.js';
export { ShellLifecycle } from './lifecycle.js';
export type { LifecycleOptions, DiscoveredAgent } from './lifecycle.js';
export { spawnAgent, loadAgentCharter, buildAgentPrompt } from './spawn.js';
export type { SpawnOptions, SpawnResult, ToolDefinition } from './spawn.js';
export { buildCoordinatorPrompt, parseCoordinatorResponse, formatConversationContext } from './coordinator.js';
export type { CoordinatorConfig, RoutingDecision } from './coordinator.js';
export { parseInput } from './router.js';
export type { MessageType, ParsedInput } from './router.js';
export { executeCommand } from './commands.js';
export type { CommandContext, CommandResult } from './commands.js';
export { MemoryManager, DEFAULT_LIMITS } from './memory.js';
export type { MemoryLimits } from './memory.js';
export { detectTerminal, safeChar, boxChars } from './terminal.js';
export type { TerminalCapabilities } from './terminal.js';
export { createCompleter } from './autocomplete.js';
export type { CompleterFunction, CompleterResult } from './autocomplete.js';
export { App } from './components/App.js';
export type { ShellApi, AppProps } from './components/App.js';

const require = createRequire(import.meta.url);
const pkg = require('../../../package.json') as { version: string };

/** Debug logger — writes to stderr only when SQUAD_DEBUG=1. */
function debugLog(...args: unknown[]): void {
  if (process.env['SQUAD_DEBUG'] === '1') {
    console.error('[SQUAD_DEBUG]', ...args);
  }
}

export async function runShell(): Promise<void> {
  const registry = new SessionRegistry();
  const renderer = new ShellRenderer();
  const teamRoot = process.cwd();

  // Initialize OpenTelemetry if endpoint is configured (e.g. Aspire dashboard)
  const telemetry = initSquadTelemetry({ serviceName: 'squad-cli', mode: 'cli' });
  if (telemetry.tracing || telemetry.metrics) {
    console.error('🔭 Telemetry active — exporting to ' + process.env['OTEL_EXPORTER_OTLP_ENDPOINT']);
  }

  // Initialize lifecycle — discover team agents
  const lifecycle = new ShellLifecycle({ teamRoot, renderer, registry });
  try {
    await lifecycle.initialize();
  } catch {
    // Non-fatal: shell works without discovered agents
  }

  // Create SDK client (auto-connects on first session creation)
  const client = new SquadClient({ cwd: teamRoot });

  let shellApi: ShellApi | undefined;
  const agentSessions = new Map<string, SquadSession>();
  let coordinatorSession: SquadSession | null = null;
  const streamBuffers = new Map<string, string>();

  // StreamBridge wires streaming pipeline events into Ink component state.
  const _bridge = new StreamBridge(registry, {
    onContent: (agentName: string, delta: string) => {
      const existing = streamBuffers.get(agentName) ?? '';
      const accumulated = existing + delta;
      streamBuffers.set(agentName, accumulated);
      shellApi?.setStreamingContent({ agentName, content: accumulated });
      shellApi?.refreshAgents();
    },
    onComplete: (message) => {
      if (message.agentName) streamBuffers.delete(message.agentName);
      shellApi?.addMessage(message);
      shellApi?.refreshAgents();
    },
    onError: (agentName: string, error: Error) => {
      shellApi?.addMessage({
        role: 'system',
        content: `❌ ${agentName}: ${error.message}`,
        timestamp: new Date(),
      });
    },
  });

  /** Extract text delta from an SDK session event. */
  function extractDelta(event: { type: string; [key: string]: unknown }): string {
    const val = event['deltaContent'] ?? event['delta'] ?? event['content'];
    const result = typeof val === 'string' ? val : '';
    debugLog('extractDelta', { type: event['type'], keys: Object.keys(event), hasDeltaContent: 'deltaContent' in event, result: result.slice(0, 80) });
    return result;
  }

  /**
   * Send a prompt and wait for the full streamed response.
   * Prefers sendAndWait (blocks until idle); falls back to sendMessage + turn_end event.
   * Returns the full response content from sendAndWait as a fallback string.
   */
  async function awaitStreamedResponse(session: SquadSession, prompt: string): Promise<string> {
    if (session.sendAndWait) {
      debugLog('awaitStreamedResponse: using sendAndWait');
      const result = await session.sendAndWait({ prompt }, TIMEOUTS.SESSION_RESPONSE_MS);
      debugLog('awaitStreamedResponse: sendAndWait returned', {
        type: typeof result,
        keys: result ? Object.keys(result as Record<string, unknown>) : [],
        hasData: !!(result as Record<string, unknown> | undefined)?.['data'],
      });
      // Return full response content as fallback for when deltas weren't captured
      const data = (result as Record<string, unknown> | undefined)?.['data'] as Record<string, unknown> | undefined;
      const content = typeof data?.['content'] === 'string' ? data['content'] as string : '';
      debugLog('awaitStreamedResponse: fallback content length', content.length);
      return content;
    } else {
      const done = new Promise<void>((resolve) => {
        const onEnd = (): void => {
          try { session.off('turn_end', onEnd); } catch { /* ignore */ }
          try { session.off('idle', onEnd); } catch { /* ignore */ }
          resolve();
        };
        session.on('turn_end', onEnd);
        session.on('idle', onEnd);
      });
      await session.sendMessage({ prompt });
      await done;
      return '';
    }
  }

  /** Send a message to an agent session and stream the response. */
  async function dispatchToAgent(agentName: string, message: string): Promise<void> {
    debugLog('dispatchToAgent:', agentName, message.slice(0, 120));
    let session = agentSessions.get(agentName);
    if (!session) {
      const charter = loadAgentCharter(agentName, teamRoot);
      const systemPrompt = buildAgentPrompt(charter);

      if (!registry.get(agentName)) {
        const roleMatch = charter.match(/^#\s+\w+\s+—\s+(.+)$/m);
        registry.register(agentName, roleMatch?.[1] ?? 'Agent');
      }

      session = await client.createSession({
        streaming: true,
        systemMessage: { mode: 'append', content: systemPrompt },
        workingDirectory: teamRoot,
      });
      agentSessions.set(agentName, session);
    }

    registry.updateStatus(agentName, 'streaming');
    shellApi?.refreshAgents();
    shellApi?.setActivityHint(`${agentName} is connecting...`);

    let accumulated = '';
    const onDelta = (event: { type: string; [key: string]: unknown }): void => {
      debugLog('agent onDelta fired', agentName, { eventType: event['type'] });
      const delta = extractDelta(event);
      if (!delta) return;
      accumulated += delta;
      shellApi?.setStreamingContent({ agentName, content: accumulated });
      shellApi?.setActivityHint(undefined); // Clear hint once content is flowing
    };

    session.on('message_delta', onDelta);
    // Listen for tool/activity events to show Copilot-style hints
    const onToolCall = (event: { type: string; [key: string]: unknown }): void => {
      const toolName = event['toolName'] ?? event['name'] ?? event['tool'];
      if (typeof toolName === 'string') {
        const hintMap: Record<string, string> = {
          'read_file': 'Reading file...',
          'write_file': 'Writing file...',
          'edit_file': 'Editing file...',
          'run_command': 'Running command...',
          'search': 'Searching codebase...',
          'spawn_agent': `Spawning specialist...`,
          'analyze': 'Analyzing dependencies...',
        };
        const hint = hintMap[toolName] ?? `Using ${toolName}...`;
        shellApi?.setActivityHint(hint);
      }
    };
    try { session.on('tool_call', onToolCall); } catch { /* event may not exist */ }
    try {
      const fallback = await awaitStreamedResponse(session, message);
      debugLog('agent dispatch:', agentName, 'accumulated length', accumulated.length, 'fallback length', fallback.length);
      if (!accumulated && fallback) {
        accumulated = fallback;
      }
    } finally {
      try { session.off('message_delta', onDelta); } catch { /* session may not support off */ }
      try { session.off('tool_call', onToolCall); } catch { /* ignore */ }
      shellApi?.setStreamingContent(null);
      shellApi?.setActivityHint(undefined);
      if (accumulated) {
        shellApi?.addMessage({
          role: 'agent',
          agentName,
          content: accumulated,
          timestamp: new Date(),
        });
      }
      registry.updateStatus(agentName, 'idle');
      shellApi?.refreshAgents();
    }
  }

  /** Send a message through the coordinator and route based on response. */
  async function dispatchToCoordinator(message: string): Promise<void> {
    debugLog('dispatchToCoordinator: sending message', message.slice(0, 120));
    shellApi?.setActivityHint('Routing your request...');
    if (!coordinatorSession) {
      const systemPrompt = buildCoordinatorPrompt({ teamRoot });
      coordinatorSession = await client.createSession({
        streaming: true,
        systemMessage: { mode: 'append', content: systemPrompt },
        workingDirectory: teamRoot,
      });
    }

    let accumulated = '';
    const onDelta = (event: { type: string; [key: string]: unknown }): void => {
      debugLog('coordinator onDelta fired', { eventType: event['type'] });
      const delta = extractDelta(event);
      if (!delta) return;
      accumulated += delta;
      shellApi?.setStreamingContent({ agentName: 'coordinator', content: accumulated });
    };

    coordinatorSession.on('message_delta', onDelta);
    try {
      const fallback = await awaitStreamedResponse(coordinatorSession, message);
      debugLog('coordinator dispatch: accumulated length', accumulated.length, 'fallback length', fallback.length);
      if (!accumulated && fallback) {
        accumulated = fallback;
      }
    } finally {
      try { coordinatorSession.off('message_delta', onDelta); } catch { /* session may not support off */ }
      shellApi?.setStreamingContent(null);
    }

    // Parse routing decision from coordinator response
    debugLog('coordinator accumulated (first 200 chars)', accumulated.slice(0, 200));
    const decision = parseCoordinatorResponse(accumulated);
    debugLog('coordinator decision', { type: decision.type, hasRoutes: !!(decision.routes?.length), hasDirectAnswer: !!decision.directAnswer });

    if (decision.type === 'route' && decision.routes?.length) {
      for (const route of decision.routes) {
        shellApi?.addMessage({
          role: 'system',
          content: `📌 Routing to ${route.agent}: ${route.task}`,
          timestamp: new Date(),
        });
        const taskMsg = route.context ? `${route.task}\n\nContext: ${route.context}` : route.task;
        await dispatchToAgent(route.agent, taskMsg);
      }
    } else if (decision.type === 'multi' && decision.routes?.length) {
      for (const route of decision.routes) {
        shellApi?.addMessage({
          role: 'system',
          content: `📌 Routing to ${route.agent}: ${route.task}`,
          timestamp: new Date(),
        });
      }
      await Promise.allSettled(
        decision.routes.map(r => dispatchToAgent(r.agent, r.task))
      );
    } else {
      // Direct answer or fallback — show coordinator response
      shellApi?.addMessage({
        role: 'agent',
        agentName: 'coordinator',
        content: decision.directAnswer ?? accumulated,
        timestamp: new Date(),
      });
    }
  }

  /** Handle dispatching parsed input to agents or coordinator. */
  async function handleDispatch(parsed: ParsedInput): Promise<void> {
    try {
      if (parsed.type === 'direct_agent' && parsed.agentName) {
        await dispatchToAgent(parsed.agentName, parsed.content ?? parsed.raw);
      } else if (parsed.type === 'coordinator') {
        await dispatchToCoordinator(parsed.content ?? parsed.raw);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (shellApi) {
        shellApi.addMessage({
          role: 'system',
          content: `❌ ${errorMsg}`,
          timestamp: new Date(),
        });
      }
    }
  }

  const { waitUntilExit } = render(
    React.createElement(App, {
      registry,
      renderer,
      teamRoot,
      version: pkg.version,
      onReady: (api: ShellApi) => { shellApi = api; },
      onDispatch: handleDispatch,
    }),
    { exitOnCtrlC: false },
  );

  await waitUntilExit();

  // Cleanup: close all sessions and disconnect
  for (const [, session] of agentSessions) {
    try { await session.close(); } catch { /* best-effort cleanup */ }
  }
  // coordinatorSession is assigned inside dispatchToCoordinator closure;
  // TS control flow can't see the mutation, so assert the type.
  const coordSession = coordinatorSession as SquadSession | null;
  if (coordSession) {
    try { await coordSession.close(); } catch { /* best-effort cleanup */ }
  }
  try { await client.disconnect(); } catch { /* best-effort cleanup */ }
  try { await lifecycle.shutdown(); } catch { /* best-effort cleanup */ }
  try { await telemetry.shutdown(); } catch { /* best-effort cleanup */ }

  console.log('👋 Squad out.');
}
