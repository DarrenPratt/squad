/**
 * ThinkingIndicator — engaging feedback during long agent operations.
 *
 * Two layers:
 *   Layer 1 (Claude-style): rotating thinking phrases with elapsed time
 *   Layer 2 (Copilot-style): activity hints from SDK events (takes priority)
 *
 * Owned by Cheritto (TUI Engineer). Design approved by Marquez.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Box, Text } from 'ink';

export interface ThinkingIndicatorProps {
  isThinking: boolean;
  elapsedMs: number;
  activityHint?: string;
}

/** Rotating thinking phrases — Claude-style. Cycled every 2-3s. */
export const THINKING_PHRASES = [
  'Analyzing',
  'Considering',
  'Synthesizing',
  'Reasoning',
  'Evaluating',
  'Reflecting',
  'Exploring',
  'Connecting',
  'Pondering',
  'Formulating',
];

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/** Phrase rotation interval: 2.5 seconds */
const PHRASE_INTERVAL_MS = 2500;

/** Color cycles through as time passes — feels alive. */
function indicatorColor(elapsedSec: number): string {
  if (elapsedSec < 5) return 'cyan';
  if (elapsedSec < 15) return 'yellow';
  return 'magenta';
}

function formatElapsed(ms: number): string {
  const sec = Math.floor(ms / 1000);
  if (sec < 1) return '';
  return `${sec}s`;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  isThinking,
  elapsedMs,
  activityHint,
}) => {
  const [frame, setFrame] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const phraseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Spinner animation — 80ms per frame
  useEffect(() => {
    if (!isThinking) return;
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % SPINNER_FRAMES.length);
    }, 80);
    return () => clearInterval(timer);
  }, [isThinking]);

  // Phrase rotation — every 2.5s
  useEffect(() => {
    if (!isThinking) return;
    phraseTimerRef.current = setInterval(() => {
      setPhraseIndex(i => (i + 1) % THINKING_PHRASES.length);
    }, PHRASE_INTERVAL_MS);
    return () => {
      if (phraseTimerRef.current) clearInterval(phraseTimerRef.current);
    };
  }, [isThinking]);

  // Reset phrase index when thinking starts
  useEffect(() => {
    if (isThinking) {
      setPhraseIndex(0);
      setFrame(0);
    }
  }, [isThinking]);

  if (!isThinking) return null;

  const elapsedSec = Math.floor(elapsedMs / 1000);
  const color = indicatorColor(elapsedSec);
  const elapsedStr = formatElapsed(elapsedMs);

  // Layer 2: Activity hint takes priority when available (Copilot-style)
  if (activityHint) {
    return (
      <Box gap={1}>
        <Text color={color}>{SPINNER_FRAMES[frame] ?? '⠋'}</Text>
        <Text color={color} italic>{activityHint}</Text>
        {elapsedStr ? <Text dimColor>({elapsedStr})</Text> : null}
      </Box>
    );
  }

  // Layer 1: Rotating thinking phrases (Claude-style)
  const phrase = THINKING_PHRASES[phraseIndex] ?? THINKING_PHRASES[0]!;
  return (
    <Box gap={1}>
      <Text color={color}>{SPINNER_FRAMES[frame] ?? '⠋'}</Text>
      <Text color={color} dimColor italic>{phrase}...</Text>
      {elapsedStr ? <Text dimColor>({elapsedStr})</Text> : null}
    </Box>
  );
};
